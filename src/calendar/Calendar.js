import React, { useState, useEffect, useRef } from "react";
import {
  DayPilot,
  DayPilotCalendar,
  DayPilotNavigator,
} from "daypilot-pro-react";
import { getEvents, getBookings, getWebs } from "./event_loader";
import resources_obj from "./resources";

import "./Calendar.css";

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

  console.log("bookingsData", bookingsData);
  console.log("webs", webs);

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
  
    bubble: new DayPilot.Bubble({
      onLoad: (args) => {
        args.html = `
          <div>
            <strong>${args.source.data.text}</strong><br>
            Start: ${new DayPilot.Date(args.source.data.start).toString("MM/dd/yyyy HH:mm")}<br>
            End: ${new DayPilot.Date(args.source.data.end).toString("MM/dd/yyyy HH:mm")}
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
          console.log(`Filter Start: ${filterStart.toISOString()}, Filter End: ${filterEnd.toISOString()}`);
          console.log(`Event Start UTC: ${eventStartUTC.toISOString()}, Event End UTC: ${eventEndUTC.toISOString()}`);
  
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
  
      // Convert the dictionary back to an array of events
      const finalEvents = Object.values(eventDict);
  
      const events = finalEvents.map((booking) => ({
        start: new DayPilot.Date(booking.start),
        end: new DayPilot.Date(booking.end),
        text: booking.title || "Untitled Event", // Use a default title if none is provided
        id: booking.id,
        resource: booking.resources, // Assuming the first space ID is the resource
      }));
  
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
  

  // Ensure to call loadEvents in the appropriate useEffect hooks
  useEffect(() => {
    loadEvent();
  }, [startDate, endDate, startTime, endTime]);






  
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
    }));
    setEvents(e);
    setSelectedEvents(e);
  };





  
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

  return (
    <div className="wrap">
      <div className="calendar">
        <button onClick={() => adjustZoom(0.1)}>Zoom In</button>
        <button onClick={() => adjustZoom(-0.1)}>Zoom Out</button>
        <p>Current Zoom: {zoomLevel.toFixed(1)}x</p>

        <div className="toolbar">
          <div>
            <label>
              Start Date:{" "}
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              End Date:{" "}
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          </div>
          <label>
            Room Type:
            <select onChange={handlePurposeChange} value={selectedPurpose}>
              <option value="All">All</option>
              <option value="Play">Play</option>
              <option value="Couple">Couple</option>
              <option value="Individual">Individual</option>
              <option value="Conference Room">Conference Room</option>
            </select>
          </label>
          <label>
            Location:
            <select onChange={handleLocationChange} value={selectedLocation}>
              <option value="All">All</option>
              <option value="RP">RP</option>
              <option value="CC">CC</option>
              <option value="Airmont">Airmont</option>
              <option value="SRR">SRR</option>
              <option value="WC">WC</option>
              <option value="2 MPD">2 MPD</option>
              <option value="M">M</option>
            </select>
          </label>
          <label>
            Name:
            <select onChange={handleNameChange} value={selectedName}>
              <option value="All">All</option>
              {resources_obj.map((resource) => (
                <option key={resource.name} value={resource.name}>
                  {resource.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Weekday:
            <select
              onChange={(e) => setSelectedWeekday(e.target.value)}
              value={selectedWeekday}
            >
              <option value="All">All</option>
              <option value="Sunday">Sunday</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
            </select>
          </label>
          <label>
            Clinical Space:
            <select
              onChange={handleClinicalSpaceChange}
              value={selectedClinicalSpace}
            >
              <option value="All">All</option>
              <option value="RP">RP</option>
              <option value="Airmont">Airmont</option>
              <option value="CC">CC</option>
              <option value="M">M</option>
              <option value="950-03">950-03</option>
              <option value="950-04">950-04</option>
              <option value="950-05">950-05</option>
              <option value="950-07">950-07</option>
            </select>
          </label>

          <label>
            Start Time:{" "}
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </label>
          <label>
            End Time:{" "}
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </label>
          <input
            name="view"
            type="button"
            onClick={applyResourceFilter}
            value="Search"
          />
        </div>
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
      </div>
    </div>
  );
};

export default Calendar;