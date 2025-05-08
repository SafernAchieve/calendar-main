import React, { useState, useEffect, useRef } from "react";
import {
  DayPilot,
  DayPilotCalendar,
  DayPilotNavigator,
} from "daypilot-pro-react";

import {
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Box,
  Typography,
  IconButton,
} from "@mui/material";

import { getEvents, getBookings, getWebs } from "./event_loader";
import resources_obj from "./resources";
import LeightBlueUserNames from "./LightBlueUserNames";
import Admin from "./Admin";
import "./Calendar.css";
import { initializeDatabase, getAllRecords } from "./database"; // Ensure the path is correctrt the function
import Database from "./database";
// Inside your component or function


const Calendar = () => {

  const today = new Date();
  // Format today's date as YYYY-MM-DD in UTC
  const formattedToday = today.toISOString().split('T')[0];

  // Calculate the date two days later in UTC
  const twoDaysLater = new Date(today);
  twoDaysLater.setUTCDate(today.getUTCDate() + 2);
  const formattedTwoDaysLater = twoDaysLater.toISOString().split('T')[0];


  const [selectedPurpose, setSelectedPurpose] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [startDate, setStartDate] = useState(formattedToday);
  const [endDate, setEndDate] = useState(formattedTwoDaysLater);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [selectedName, setSelectedName] = useState("All");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [bookingsData, setBookingsData] = useState();
  const [webs, setWebs] = useState();
  const [selectedWeekday, setSelectedWeekday] = useState("All");
  const [selectedClinicalSpace, setSelectedClinicalSpace] = useState("All");
  const [adminUser, setAdminUser] = useState([]);
  const [supervisorUser, setSupervisorUser] = useState([]);
  const [showDatabase, setShowDatabase] = useState(false); // State to toggle Database component


  console.log("bookingsData", bookingsData);
  console.log("webs", webs);
  const getDateParts = (dtstring) => {
    const year = dtstring.slice(0, 4);
    const month = dtstring.slice(4, 6);
    const day = dtstring.slice(6, 8);
    const hours = dtstring.slice(9, 11);
    const minutes = dtstring.slice(11, 13);
  
    const monthNumber = Number(month);
    const monthIndex = monthNumber - 1;
  
    return {
      year, monthIndex, day, hours, minutes
    };
  };
  
  const getDateFromParts = (parts) => {
    return new Date(
      parts.year,
      parts.monthIndex,
      parts.day,
      parts.hours,
      parts.minutes
    );
  };
  
  const formatUntilDate = (until) => {
    const parts = getDateParts(until);
    const date = getDateFromParts(parts);
    return date.toLocaleString('en-US', { hour12: true, timeZone: 'UTC' });
  };
  
  // Helper function to format the recurrence rule
  const formatRecurrenceRule = (recurrenceRule) => {
    const lines = recurrenceRule.split("\n");
    const dtstart = lines.find(line => line.startsWith("DTSTART")).split(":")[1];
    const dtend = lines.find(line => line.startsWith("DTEND")).split(":")[1];
    const rrule = lines.find(line => line.startsWith("RRULE"));
  
    const startParts = getDateParts(dtstart);

    const startDate = getDateFromParts(startParts);
  
  
    const ruleParts = rrule.split(";").reduce((acc, part) => {
      const [key, value] = part.split("=");
      acc[key] = value;
      return acc;
    }, {});
  
    const frequency = ruleParts.FREQ || "WEEKLY";
    const until = ruleParts.UNTIL ? formatUntilDate(ruleParts.UNTIL) : "N/A";
  
    return `
      Start: ${startDate.toLocaleString('en-US', { hour12: true, timeZone: 'UTC' })}<br>
   
      Frequency: ${frequency}<br>
      Until: ${until}<br>
    `;
  };


  const [config, setConfig] = useState({
    locale: "en-us",
    columnWidthSpec: "Auto",
    viewType: "Resources",
    headerLevels: 1,
    headerHeight: 30,
    cellHeight: 30,
    crosshairType: "Header",
    showCurrentTime: false,
    cellDuration: 15,
    allowEventOverlap: true,
    timeRangeSelectedHandling: "Enabled",
    eventDeleteHandling: "Disabled",
    eventMoveHandling: "false",
    eventResizeHandling: "false",
    eventClickHandling: "Disabled",
    eventHoverHandling: "Bubble", // Enables event hover
    businessBeginsHour: 9,
    businessEndsHour: 17,
    bubble: new DayPilot.Bubble({
      onLoad: (args) => {
        let recurrenceRuleHtml = "";
        if (args.source.data.recurrenceRule) {
          recurrenceRuleHtml = `<br>Recurrence:<br>${formatRecurrenceRule(args.source.data.recurrenceRule)}`;
        }
        args.html = `
   <div>
  <strong>${args.source.data.text}</strong><br>
  Start: ${new DayPilot.Date(args.source.data.start).toString("MM/dd/yyyy hh:mm tt")}<br>
  End: ${new DayPilot.Date(args.source.data.end).toString("MM/dd/yyyy hh:mm tt")}
  ${recurrenceRuleHtml}
</div>
        `;
      },
    }),

  });

  const calendarRef = useRef(null);




  const loadEvent = async () => {
    try {
        const bookingsData = await getBookings(startDate, endDate);
        const bookingBook = bookingsData.bookings;

        // Sort events by their start date
        const sortedEvents = bookingBook.sort((a, b) => {
            const startA = new Date(a.start).getTime(); // Convert to timestamp for comparison
            const startB = new Date(b.start).getTime();
            return startA - startB; // Sort in ascending order
        });

        // Create a dictionary to store events by resource and time slot
        const eventDict = {};
        const recurringEvents = [];
        sortedEvents.forEach((event) => {
            if (event.recurrenceRule) {
                recurringEvents.push(event);
            }
        });

        // Remove non-recurring events that intersect with recurring events
        const filteredSortedEvents = sortedEvents.filter((event) => {
            if (event.recurrenceRule) {
                return true;
            }
            for (const recurringEvent of recurringEvents) {
                const recurringEventStart = new Date(recurringEvent.start).getTime();
                const recurringEventEnd = new Date(recurringEvent.end).getTime();
                const eventStart = new Date(event.start).getTime();
                const eventEnd = new Date(event.end).getTime();
                if (
                    (eventStart >= recurringEventStart && eventStart < recurringEventEnd) ||
                    (eventEnd > recurringEventStart && eventEnd <= recurringEventEnd) ||
                    (eventStart <= recurringEventStart && eventEnd >= recurringEventEnd)
                ) {
                    return false;
                }
            }
            return true;
        });

        // Filter events by start time and end time for all days within the date range
        const startTimeParts = startTime.split(":");
        const endTimeParts = endTime.split(":");
        const startHour = parseInt(startTimeParts[0]);
        const startMinute = parseInt(startTimeParts[1]);
        const endHour = parseInt(endTimeParts[0]);
        const endMinute = parseInt(endTimeParts[1]);

        const extendedEndDate = new DayPilot.Date(endDate).addDays(1); // Extend end date by one day

        const filteredEvents = filteredSortedEvents.filter((event) => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);

            // Check if the event occurs within the time range for any day within the date range
            for (let date = new Date(startDate); date < new Date(extendedEndDate); date.setDate(date.getDate() + 1)) {
                const filterStart = new Date(date);
                filterStart.setHours(startHour);
                filterStart.setMinutes(startMinute);

                const filterEnd = new Date(date);
                filterEnd.setHours(endHour);
                filterEnd.setMinutes(endMinute);

                const eventStartUTC = new Date(eventStart.getTime() + (eventStart.getTimezoneOffset() * 60 * 1000));
                const eventEndUTC = new Date(eventEnd.getTime() + (eventEnd.getTimezoneOffset() * 60 * 1000));

                // Log the filter start and end times for debugging
               // console.log(`Filter Start: ${filterStart.toISOString()}, Filter End: ${filterEnd.toISOString()}`);
               // console.log(`Event Start UTC: ${eventStartUTC.toISOString()}, Event End UTC: ${eventEndUTC.toISOString()}`);

                // Return true if event start time and end time are within the selected time range
                if (eventStartUTC >= filterStart && eventEndUTC <= filterEnd) {
                    return true;
                }
            }
            return false;
        });

        // Create a dictionary to store events by resource and time slot
        filteredEvents.forEach((event) => {
            const key = `${event.resources}-${event.start}-${event.end}`;
            if (!eventDict[key]) {
                eventDict[key] = event;
            } else if (event.recurrenceRule) {
                // If a recurring event conflicts with a non-recurring event, prioritize the recurring event
                eventDict[key] = event;
            }
        });
       // const adminUser = Admin;
        const Supervision = LeightBlueUserNames;
     
        // Convert the dictionary back to an array of events
        const finalEvents = Object.values(eventDict);

        const events = finalEvents.map((booking) => ({
          start: new DayPilot.Date(booking.start),
          end: new DayPilot.Date(booking.end),
          text: booking.venueUser ? `${booking.venueUser.firstName} ${booking.venueUser.lastName}` : "Untitled Event", // Check if venueUser exists
          id: booking.id,
          resource: booking.resources, // Assuming the first space ID is the resource
          recurrenceRule: booking.recurrenceRule || "", // Ensure that recurrenceRule is set
          backColor: booking.venueUser && adminUser.includes(booking.venueUser.email) // Step 3: Use adminUser state
            ? "#FFA07A" // Light orange color for admin users
            : booking.venueUser && supervisorUser.includes(booking.venueUser.email) 
              ? "#87CEFA" // Light blue color for supervision events
              : "", // Default color
          }
        )
        
      );

  





          
        const mergedEvents = events.reduce((acc, current) => {
            const existingEvent = acc.find((event) => {
                return (
                    event.start === current.start &&
                    event.end === current.end &&
                    event.resource === current.resource
                );
            });

            if (existingEvent) {
                // If an existing event is found, merge the titles
                existingEvent.text += `, ${current.text}`;
            } else {
                // If no existing event is found, add the current event to the accumulator
                acc.push(current);
            }

            return acc;
        }, []);

        setEvents(mergedEvents);
        setSelectedEvents(mergedEvents);
    } catch (error) {
        console.error("Error loading events", error);
    }
};
  




useEffect(() => {
  const fetchAdminUsers = async () => {
   
    const request = indexedDB.open("testDB", 30);
    initializeDatabase(request);

    request.onsuccess = async (event) => {
      const dbInstance = event.target.result;
      try {
        const adminUserRecords = await getAllRecords(dbInstance,"users"); // Wait for the records to be retrieved
        console.log("Fetched admin users:", adminUserRecords);
        const adminUserEmails = adminUserRecords.map(record => record.admin.trim()); // Extract emails and trim any extra spaces
        setAdminUser(adminUserEmails);

        const supervisorUserRecords = await getAllRecords(dbInstance, "supervisor");
        console.log("Fetched supervisor users:", supervisorUserRecords);
        const supervisorUserEmails = supervisorUserRecords.map(record => record.name.trim());
        setSupervisorUser(supervisorUserEmails);

        const resources = await getAllRecords(dbInstance, "resources");
        console.log("Fetched supervisor users:", resources);

      } catch (error) {
        console.error("Error retrieving admin users:", error);
      }
    };

    request.onerror = (event) => {
      console.error("Error initializing database:", event.target.error);
    };









    
  };

  fetchAdminUsers();
}, []);






  // Ensure to call loadEvents in the appropriate useEffect hooks
  useEffect(() => {
    if (adminUser.length > 0 && supervisorUser.length > 0) {
      loadEvent();
    }
  }, [startDate, endDate, startTime, endTime, adminUser,supervisorUser]);






/*   
  const loadEvents = async () => {
    const events = await getEvents(startDate, endDate);
    console.log(
      events
        .map((e) => e.resources)
        .filter((value, index, self) => self.indexOf(value) === index)
    );

    const filteredEvents = events.filter((booking) => {
      const bookingStart = new DayPilot.Date(booking.start);
      const bookingEnd = new DayPilot.Date(booking.end);
      return (
        bookingStart >= new DayPilot.Date(startDate) &&
        bookingEnd <= new DayPilot.Date(endDate)
      );
    });

    // Sort events by their start date
    const sortedEvents = filteredEvents.sort((a, b) => {
      const startA = new Date(a.start).getTime(); // Convert to timestamp for comparison
      const startB = new Date(b.start).getTime();
      return startA - startB; // Sort in ascending order
    });

    const e = sortedEvents.map((event) => ({
      start: new DayPilot.Date(event.start),
      end: new DayPilot.Date(event.end),
      text: event.summary,
      id: event.uid,
      resource: event.resources,
      recurrenceRule: event.recurrenceRule || "", // Ensure that recurrenceRule is set
    }));
    setEvents(e);
    setSelectedEvents(e);
  };
 */




  
  useEffect(() => {
    daysResources();
  }, []);

  const initializeResources = (
    date,
    purpose = "All",
    location = "All",
    clinicalSpace = "All",
    name = "All"
  ) => {
    const resources = resources_obj.map((resource) => ({
      ...resource,
      start: date,
    }));

    return resources.filter((resource) => {
      return (
        (purpose === "All" || resource.purpose === purpose) &&
        (location === "All" || resource.location === location) &&
        (clinicalSpace === "All" || resource.ClinicalSpace === clinicalSpace) &&
        (name === "All" || resource.name === name)
      );
    });
  };

  useEffect(() => {
    daysResources();
  }, [selectedWeekday]);

  const handleNameChange = (e) => {
    setSelectedName(e.target.value);
  };

  const handleClinicalSpaceChange = (e) => {
    setSelectedClinicalSpace(e.target.value);
  };

  const handlePurposeChange = (e) => {
    setSelectedPurpose(e.target.value);
  };

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
  };

  const applyResourceFilter = () => {
    const date = new Date();
    const filteredResources = initializeResources(
      date,
      selectedPurpose,
      selectedLocation,
      selectedClinicalSpace,
      selectedName
    );

    daysResources();
  };

  function convertDateFormat(dateString) {
    const dateParts = dateString.split("-");
    return `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
  }

  const daysResources = () => {
    const columns = [];
    // Use below code for UTC

    const startFormatted = convertDateFormat(startDate);
    const endFormatted = convertDateFormat(endDate);
    const start = new Date(startFormatted);
    const end = new Date(endFormatted);

    // Use below code for GMT
    // const start = new Date(startDate);
    //const end = new Date(endDate);

    end.setHours(23, 59, 59);
    const daysDifference =
      Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Get all events that fall within the date range
    const allEvents = events;

    for (let i = 0; i < daysDifference; i++) {
      const currentDay = new Date(start);
      currentDay.setDate(start.getDate() + i);

      const dayOfWeek = currentDay.toLocaleString("en-US", { weekday: "long" });

      if (selectedWeekday !== "All" && dayOfWeek !== selectedWeekday) {
        continue;
      }

      const dayResources = initializeResources(
        currentDay,
        selectedPurpose,
        selectedLocation,
        selectedClinicalSpace,
        selectedName
      );

      columns.push({
        id: i,
        name: currentDay.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          timezone: "UTC",
        }),
        children: dayResources,
      });
    }

    // Add a default column if the columns array is empty
    if (columns.length === 0) {
      columns.push({
        id: 0,
        name: "No columns available",
        children: [],
      });
    }

    const columnWidth =
      selectedName !== "All" &&
      selectedClinicalSpace === "All" &&
      selectedPurpose === "All" &&
      selectedLocation === "All"
        ? 210
        : 120;

    setConfig({
      ...config,
      columnWidthSpec: "Fixed",
      columnWidth: columnWidth,
      columns,
      headerLevels: 2,
      events: allEvents,
    });
  };

  const endDateTillMidnight = new Date(endDate);
  endDateTillMidnight.setHours(23, 59, 59);

  const adjustZoom = (delta) => {
    setZoomLevel((prev) => {
      const newZoom = Math.min(Math.max(prev + delta, 0.2), 2); // Zoom between 0.5x and 2x
      return newZoom;
    });
  };

  useEffect(() => {
    // Update column and cell sizes when zoom changes
    setConfig((prevConfig) => ({
      ...prevConfig,
      columnWidth: 140 * zoomLevel,
      cellHeight: 30 * zoomLevel,
    }));
  }, [zoomLevel]);

  const toggleDatabase = () => {
    setShowDatabase((prev) => !prev);
  };


  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
      <Button
        variant="contained"
        color={showDatabase ? "secondary" : "primary"}
        onClick={toggleDatabase}
      >
        {showDatabase ? "Close Manage Users" : "Manage Users"}
      </Button>

      {showDatabase && (
        <Box
          sx={{
            transform: showDatabase ? "translateX(0)" : "translateX(-100%)",
            opacity: showDatabase ? 1 : 0,
            transition: "transform 0.5s ease-in-out, opacity 0.5s ease-in-out",
          }}
        >
          <Database />
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 1 }}>
        <Button variant="outlined" onClick={() => adjustZoom(0.1)}>
          Zoom In
        </Button>
        <Button variant="outlined" onClick={() => adjustZoom(-0.1)}>
          Zoom Out
        </Button>
        <Typography>Current Zoom: {zoomLevel.toFixed(1)}x</Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
          py: 2,
          px: 3,
          borderRadius: 2,
          backgroundColor: "#F9F9F9",
          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
          border: "1px solid #E0E0E0",
        }}
      >
        <TextField
          type="date"
          label="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          sx={{ flex: 1 }}
        />
        <TextField
          type="date"
          label="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          sx={{ flex: 1 }}
        />
        <FormControl sx={{ flex: 1 }}>
          <InputLabel>Room Type</InputLabel>
          <Select value={selectedPurpose} onChange={handlePurposeChange}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Playroom">Playroom</MenuItem>
            <MenuItem value="Couple">Couple</MenuItem>
            <MenuItem value="Individual">Individual</MenuItem>
            <MenuItem value="Conference Room">Conference Room</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ flex: 1 }}>
          <InputLabel>Location</InputLabel>
          <Select value={selectedLocation} onChange={handleLocationChange}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="RP">RP</MenuItem>
            <MenuItem value="CC">CC</MenuItem>
            <MenuItem value="Airmont">Airmont</MenuItem>
            <MenuItem value="SRR">SRR</MenuItem>
            <MenuItem value="WC">WC</MenuItem>
            <MenuItem value="2 MPD">2 MPD</MenuItem>
            <MenuItem value="M">M</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ flex: 1 }}>
          <InputLabel>Name</InputLabel>
          <Select value={selectedName} onChange={handleNameChange}>
            <MenuItem value="All">All</MenuItem>
            {resources_obj.map((resource) => (
              <MenuItem key={resource.name} value={resource.name}>
                {resource.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ flex: 1 }}>
          <InputLabel>Clinical Space</InputLabel>
          <Select
            value={selectedClinicalSpace}
            onChange={handleClinicalSpaceChange}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="RP">RP</MenuItem>
            <MenuItem value="Airmont">Airmont</MenuItem>
            <MenuItem value="CC">CC</MenuItem>
            <MenuItem value="M">M</MenuItem>
            <MenuItem value="950-03">950-03</MenuItem>
            <MenuItem value="950-04">950-04</MenuItem>
            <MenuItem value="950-05">950-05</MenuItem>
            <MenuItem value="950-07">950-07</MenuItem>
          </Select>
        </FormControl>
        <TextField
          type="time"
          label="Start Time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <TextField
          type="time"
          label="End Time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
        <Button variant="contained" onClick={applyResourceFilter}>
          Search
        </Button>
      </Box>

      <Box>
      <DayPilotCalendar
          {...config}
          ref={calendarRef}
          events={selectedEvents}
          startDate={startDate}
          endDate={endDateTillMidnight}
          idField="id"
          startField="start"
          endField="end"
          resourceField="resource"
          startTime={startTime}
        />
      </Box>
    </Box>
  );
};

export default Calendar;