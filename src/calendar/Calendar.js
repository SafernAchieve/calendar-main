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
  const [selectedPurpose, setSelectedPurpose] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [startDate, setStartDate] = useState("2025-01-07");
  const [endDate, setEndDate] = useState("2025-01-08");
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
    // eventArrangement: "Cascade",
    allowEventOverlap: true,
    timeRangeSelectedHandling: "Enabled",
    onTimeRangeSelected: async (args) => {
      const modal = await DayPilot.Modal.prompt(
        "Create a new event:",
        "Event 1"
      );
      const dp = args.control;
      dp.clearSelection();
      if (modal.canceled) {
        return;
      }

      const newEvent = {
        id: DayPilot.guid(),
        start: args.start,
        end: args.end,
        text: modal.result,
        resource: args.resource,
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    },
    eventDeleteHandling: "Disabled",
    eventMoveHandling: "Update",

    onEventMoved: (args) => {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === args.e.id()
            ? {
                ...event,
                start: args.newStart,
                end: args.newEnd,
                resource: args.newResource,
              }
            : event
        )
      );
    },
    eventResizeHandling: "Update",
    onEventResized: (args) => {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === args.e.id()
            ? { ...event, start: args.newStart, end: args.newEnd }
            : event
        )
      );
    },

    eventClickHandling: "Disabled",
    eventHoverHandling: "Disabled",
  });

  const calendarRef = useRef(null);
;

 
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

    // Create a dictionary to store events by resource and time slot
    filteredSortedEvents.forEach((event) => {
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
  } catch {
    console.error("Error loading events");
  }
};

// Ensure to call loadEvents in the appropriate useEffect hooks
useEffect(() => {
  loadEvent();
},[startDate, endDate, startTime, endTime]);


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
    return bookingStart >= new DayPilot.Date(startDate) && bookingEnd <= new DayPilot.Date(endDate);
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
      selectedLocation
    );
 
    daysResources();
  };

  function convertDateFormat(dateString) {
    const dateParts = dateString.split('-');
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
        selectedName
      );

      columns.push({
        id: i,
        name: currentDay.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          timezone: "UTC"
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
    <div className={"wrap"}>
      <div className={"left"}>
        <DayPilotNavigator
          selectMode={"Day"}
          showMonths={3}
          skipMonths={3}
          selectionDay={startDate}
          startDate={startDate}
          onTimeRangeSelected={(args) => setStartDate(args.day)}
        />
      </div>
      <div className={"calendar"}>
        <button onClick={() => adjustZoom(0.1)}>Zoom In</button>
        <button onClick={() => adjustZoom(-0.1)}>Zoom Out</button>
        <p>Current Zoom: {zoomLevel.toFixed(1)}x</p>

        <div className={"toolbar"}>
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
          Name:
          <select onChange={handleNameChange} value={selectedName}>
            <option value="All">All</option> {/* Add an option for "All" */}
            {resources_obj.map((resource) => (
              <option key={resource.name} value={resource.name}>
                {resource.name}
              </option>
            ))}
          </select>

          <label>
            Weekday:
            <select onChange={(e) => setSelectedWeekday(e.target.value)} value={selectedWeekday}>
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
              Start Time:{" "}
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </label>
          </div>
          <div>
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
