
import axios from "axios";
import { DayPilot, DayPilotCalendar } from "daypilot-pro-react";
import resources_obj from "./resources";
import { RRule } from 'rrule';

// Dynamically determine the base URL
const BASE_URL = window.location.origin.includes('localhost') 
    ? "http://localhost:4000" // Local development
    : "https://abhroomserver.azurewebsites.net"; // Azure production

const EVENTS_URL = `${BASE_URL}/events`;
const BOOKINGS_URL = `${BASE_URL}/bookings`;
const WEBS_URL = `${BASE_URL}/webs`;

export const getEvents = async (start, end) => {
    const startDate = new DayPilot.Date(start);
    const endDate = new DayPilot.Date(end);
    const response = await axios.get(`${EVENTS_URL}?start=${startDate.toString("yyyy-MM-ddTHH:mm:ssZ")}&end=${endDate.toString("yyyy-MM-ddTHH:mm:ssZ")}`);
    return response.data;
};







const generateRecurringEvents = (booking, startDate, endDate) => {
    const events = [];

    // Extract DTSTART, DTEND, RRULE, and EXDATE from the recurrenceRule
    const dtStartMatch = booking.recurrenceRule.match(/DTSTART:([^\r\n]+)/);
    const dtEndMatch = booking.recurrenceRule.match(/DTEND:([^\r\n]+)/);
    const rruleMatch = booking.recurrenceRule.match(/RRULE:([^\r\n]+)/);
    const exdateMatch = booking.recurrenceRule.match(/EXDATE:([^\r\n]+)/);

    if (!dtStartMatch || !dtEndMatch || !rruleMatch) {
        console.error("Invalid recurrenceRule format:", booking.recurrenceRule);
        return events;
    }

    // Reformat the date string to make it parsable by the Date object
    const reformatDateString = (dateString) => {
        const year = dateString.slice(0, 4);
        const month = dateString.slice(4, 6);
        const day = dateString.slice(6, 8);
        const time = dateString.slice(9, 15).replace(/(.{2})(?!$)/g, '$1:'); // Add colons to time
        return `${year}-${month}-${day}T${time}Z`;
    };
    const dtStart = new Date(reformatDateString(dtStartMatch[1])); // Start date of the first occurrence
    const dtEnd = new Date(reformatDateString(dtEndMatch[1])); // End date of the first occurrence
    const rrule = rruleMatch[1]; // RRULE part (e.g., "FREQ=WEEKLY;UNTIL=20251228T235959Z;INTERVAL=1;BYDAY=SU")
    const exdates = exdateMatch ? exdateMatch[1].split(',').map((exdate) => new Date(reformatDateString(exdate))) : []; // EXDATE part (e.g., "20250122T000000Z")
    // Parse the RRULE
    const rruleParams = rrule.split(';').reduce((acc, param) => {
        const [key, value] = param.split('=');
        acc[key] = value;
        return acc;
    }, {});

    const frequency = rruleParams.FREQ; // FREQ (e.g., WEEKLY, DAILY, etc.)
    const until = rruleParams.UNTIL ? new Date(reformatDateString(rruleParams.UNTIL)) : null; // Expiration date for recurrence
    const interval = rruleParams.INTERVAL ? parseInt(rruleParams.INTERVAL, 10) : 1; // Interval (e.g., every 1 week)
    const byDay = rruleParams.BYDAY ? rruleParams.BYDAY.split(',') : null; // Days of the week (e.g., SU, MO, etc.)

    // Create a map of BYDAY values and their corresponding day of the week
    const byDayMap = {
        SU: 0, // Sunday
        MO: 1, // Monday
        TU: 2, // Tuesday
        WE: 3, // Wednesday
        TH: 4, // Thursday
        FR: 5, // Friday
        SA: 6, // Saturday
    };

    // Calculate the duration of the event
    const eventDuration = dtEnd.getTime() - dtStart.getTime();

    // Generate recurring events
    let currentDate = new Date(dtStart);

    while (currentDate <= endDate.toDate() && (!until || currentDate <= until)) {
        // Check if the current date is within the startDate and endDate constraints
        if (currentDate >= startDate.toDate()) {
            // Check if the current date matches the specified day of the week (for WEEKLY frequency)
            if (frequency === 'WEEKLY' && byDay) {
                const dayOfWeek = currentDate.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
                const byDayValues = byDay.map((byDayValue) => byDayMap[byDayValue]); // Get the day of the week corresponding to each BYDAY value
                if (byDayValues.includes(dayOfWeek)) {
                    // Check if the current date is in the EXDATE list
                    const isExcluded = exdates.some((exdate) => currentDate.toISOString() === exdate.toISOString());

                    if (!isExcluded) {
                        const newEvent = {
                            ...booking,
                            start: currentDate.toISOString(),
                            end: new Date(currentDate.getTime() + eventDuration).toISOString(),
                            id: `${dtStart.toISOString()}`, // Unique ID for each occurrence
                        };
                        events.push(newEvent);
                    }
                }
            } else if (frequency !== 'WEEKLY') {
                // For non-WEEKLY frequencies, add the event regardless of the day of the week
                const newEvent = {
                    ...booking,
                    start: currentDate.toISOString(),
                    end: new Date(currentDate.getTime() + eventDuration).toISOString(),
                    id: `${dtStart.toISOString()}`, // Unique ID for each occurrence
                };
                events.push(newEvent);
            }
        }

        // Move to the next occurrence based on the frequency
        switch (frequency) {
            case 'DAILY':
                currentDate.setUTCDate(currentDate.getUTCDate() + interval);
                break;
            case 'WEEKLY':
                // Iterate through each day and skip to the next week after processing all days
                currentDate.setUTCDate(currentDate.getUTCDate() + 1);
                if (currentDate.getUTCDay() === 0) { // 0 = Sunday
                    currentDate.setUTCDate(currentDate.getUTCDate() + 7 * (interval - 1));
                }
                break;
            case 'MONTHLY':
                currentDate.setUTCMonth(currentDate.getUTCMonth() + interval);
                break;
            case 'YEARLY':
                currentDate.setUTCFullYear(currentDate.getUTCFullYear() + interval);
                break;
            default:
                console.error("Unsupported frequency:", frequency);
                return events;
        }
    }

    return events;
};




export const getVenues = async () => {
    try {
        const response = await axios.get(`${BOOKINGS_URL}`);
        console.log('getVenues response.data:', response.data);
        const { venueusers } = response.data;
        return venueusers;
    } catch (error) {
        console.error('Error fetching venues:', error);
        throw error;
    }
};
getVenues(); 


/* export const getBookings = async (start, end ) => {
  const startDate = new DayPilot.Date(start);
  const endDate = new DayPilot.Date(end);
  try {
        const [bookingsResponse, webs] = await Promise.all([
            axios.get(BOOKINGS_URL, {
                params: {
                    start: startDate.toString(),
                    end: endDate.toString(),
                },
            }),
            getWebs(),
        ]);

        let rooms = webs.spaces.map((space) => space.name);
        let room_names = resources_obj.map((resource) => resource.name);

        rooms.sort();
        room_names.sort();

        const roomNamesDict = {};
        webs.spaces.map((space) => {
            roomNamesDict[space.id] = space.name;
        });

        const bookings = bookingsResponse.data.bookings;

        // Filter out bookings that do not have a recurrence rule
        const recurringBookings = bookings.filter((booking) => booking.recurrenceRule);


        // Process each recurring booking to add recurring events
        const allBookings = recurringBookings.flatMap((booking) => {
            const endDatePlusOne = new DayPilot.Date(endDate).addDays(1);
            return generateRecurringEvents(booking, startDate, endDatePlusOne); // Only return generated events
        });
    
        // Assign resources to each booking
        allBookings.forEach((booking) => {
            booking.resources = roomNamesDict[booking.spaces[0]];
        });
    
        // Return the processed bookings
        return {
            bookings: allBookings,
        };
        } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}; */






export const getBookings = async (start, end) => {
    const startDate = new DayPilot.Date(start);
    const endDate = new DayPilot.Date(end);
    try {
        const [bookingsResponse, webs, venueUsers] = await Promise.all([
            axios.get(BOOKINGS_URL, {
                params: {
                    start: startDate.toString(),
                    end: endDate.toString(),
                },
            }),
            getWebs(),
            getVenues(),
        ]);

        let rooms = webs.spaces.map((space) => space.name);
        let room_names = resources_obj.map((resource) => resource.name);

        rooms.sort();
        room_names.sort();

        const roomNamesDict = {};
        webs.spaces.forEach((space) => {
            roomNamesDict[space.id] = space.name;
        });

        const bookings = bookingsResponse.data.bookings;

        // Filter out bookings that do not have a recurrence rule
        const recurringBookings = bookings.filter((booking) => booking.recurrenceRule);

        // Process each recurring booking to add recurring events
        const allBookings = recurringBookings.flatMap((booking) => {
            const endDatePlusOne = new DayPilot.Date(endDate).addDays(1);
            return generateRecurringEvents(booking, startDate, endDatePlusOne); // Only return generated events
        });

        // Assign resources to each booking
        allBookings.forEach((booking) => {
            booking.resources = roomNamesDict[booking.spaces[0]];
        });

        // Create a dictionary to map venue user IDs to their data for quick lookup
        const venueUserDict = venueUsers.reduce((dict, user) => {
            dict[user.id] = user;
            return dict;
        }, {});

        // Add venue user data to each booking
        allBookings.forEach((booking) => {
            const venueUser = venueUserDict[booking.venueuser];
            if (venueUser) {
                booking.venueUser = {
                    id: venueUser.id,
                    firstName: venueUser.firstName,
                    lastName: venueUser.lastName,
                    email: venueUser.username,
                };
            }
        });
console.log("allvenuBookings", allBookings);
        // Return the processed bookings
        return {
            bookings: allBookings,
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};












export const getBooking = async () => {
    const response = await axios.get(BOOKINGS_URL)
    console.log('getBookings response.data:', response.data)
    return response.data;
}


export const getWebs = async () => {
    const response = await axios.get(WEBS_URL)
    console.log('getWebs response.data:', response.data)
    return response.data;
}