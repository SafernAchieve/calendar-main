const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const WebSocket = require("ws");
const ICAL = require("ical");
const axios = require("axios");
const { datetime, rrulestr } = require("rrule");

const app = express();
app.use(bodyParser.json());
const server = http.createServer(app); // Create an HTTP server using Express

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.static("public"));

let verificationToken =
  "CfDJ8EEocIaYeINNkvfZHhJ8P5rX7MLLjP8N9EsWc15yTKaGn_5uROl3z0DhwGr0xWaUCB6oe2k_YOYuOu714j4qIb__xoC7Ixgl_7oSofMPX95jILfumRZdCqYhXrqTNWSjsUa9pfv18O9jIICB3h5M-WMRhmIVdQBwx_aHmFJ2o_ldHeYNbbSgV2OnFFJDwRisdw";
let applicationCookie =
  "CfDJ8EEocIaYeINNkvfZHhJ8P5o8uQzrXSIAzvYLLK8ncr_YqyqZ-EigKFKaW0yZUj1r6RurVmPIg1gqKZwzFEsd4QZ-6es-neQkFjujLxoPk26kqlGBf0LvoQtqxFX9lDRd9eWp65qwRMDVIHRKkcxPxImpI3yFVDddugePekuLDUFFSh5_8LHeG_L-3_b6-rUtZmBjoqY6IDq7bCngzwi6X-J5qwjHMH-X0acSgg_paP-Q_bTi4j5izUjRWEPUT_Ty16PY1bHiddU_MSK0Jes6AUS-PD-3uvjAO4dMJQS_e9MujJoTRhsdsY63gCZfuZPDvUkBMAWPERkfpu9tJcKXluFDPg4f62lXJXKuusPkaXhN3pl5B1ERlTeR4FrIwIbBBezPhWG37WoW-7un2SMH3ouKcD_jvhkKfroJ-SzEbzxlkHCP6Ais0l3boz64IA6HydabLxTGDqu474ydI3jK2oQvjkg0h4lYr9yP6HnbM-hXSc5741_IT0uT2pf1X7qNpcm0g3P8kzvxU14D3d59_NGM7cxNkNBKjy-M6CpAbbZ6RmyPvyOdtzrq970KrB9vfHciHpzVh3lad09HzWBezzwlV7V_Br5joCJnuivrSf_rzwHl7IzHC7lAlPDMuhvwFkExVLjXzWWtYLy82iJHsZfCvsZ5oVC5oEr2o4JclLNEbiR4UODqAxPi_lXHTGllU-JUOLchhb4PDoYa6I7RS3vKo9HU9Hwsrelaw3M3os7-d3Sh7SY2HT5TbjjHLKO8TpT5b7fiU--F4RewINkmo6kG5gbrF-MnirHZKCfeIzlEoC9HZhr6JQAQDDU4kCKAng";
let verificationCookie =
  "CfDJ8EEocIaYeINNkvfZHhJ8P5opcYVK5vjeOQw8fSkqQ8qHoy97-Sjqq7s-ePwG5n9Dz5TbFSqRKG7IlQv_lx-Cl9chQbHOOBytRQF22-p8rmSLXnLO2RQI-BOeb8CdL5v7ni0daFvXNjIwe7e72rWTBLc";

function getSkeddaHeaders() {
  const skeddaHeaders = {
    "sec-ch-ua-platform": '"Windows"',
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "sec-ch-ua":
      '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    "X-Skedda-RequestVerificationToken": verificationToken,
    "sec-ch-ua-mobile": "?0",
    Accept: "*/*",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Dest": "empty",
    host: "achieverooms.skedda.com",
    Cookie: `X-Skedda-RequestVerificationCookie=${verificationCookie}; X-Skedda-ApplicationCookie=${applicationCookie}`,
  };
  console.log('new headers:', skeddaHeaders);
  return skeddaHeaders;
}

app.post("/tokens", async (req, res) => {
  console.log("req.body", req.body);
  verificationToken = req.body.VerificationToken;
  applicationCookie = req.body.ApplicationCookie;
  verificationCookie = req.body.VerificationCookie;

  res.send("OK");
});

app.get("/bookings", async (req, res) => {
  const url = "https://achieverooms.skedda.com/bookingslists";
  const params = {
    start: "2025-01-02T00:00:00",
    end: "2025-03-14T23:59:59.999",
  };
  const headers = getSkeddaHeaders();
  try {
    const response = await axios.get(url, {
      params,
      headers,
    });

    res.json(response.data); // Forward the response data
  } catch (error) {
    console.error("Error fetching bookings:", error.message);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

app.get("/webs", async (req, res) => {
  const url = "https://achieverooms.skedda.com/webs";
  const headers = getSkeddaHeaders();
  try {
    const response = await axios.get(url, {
      headers,
    });

    res.json(response.data); // Forward the response data
  } catch (error) {
    console.error("Error fetching webs:", error.message);
    res.status(500).json({ error: "Failed to fetch webs" });
  }
});

app.get("/enriched-bookings", async (req, res) => {
  const bookingsUrl = "https://achieverooms.skedda.com/bookingslists";
  const websUrl = "https://achieverooms.skedda.com/webs";
  const params = {
    start: "2025-01-02T00:00:00",
    end: "2025-03-14T23:59:59.999",
  };
  const headers = getSkeddaHeaders();
  try {
    // Fetch bookings
    const bookingsResponse = await axios.get(bookingsUrl, {
      params,
      headers,
    });

    // Fetch rooms (webs)
    const websResponse = await axios.get(websUrl, {
      headers,
    });

    const bookingsData = bookingsResponse.data.bookings;
    const roomsData = websResponse.data.spaces;

    // Map room IDs to room names for quick lookup
    const roomNameMap = roomsData.reduce((map, room) => {
      map[room.id] = room.name;
      return map;
    }, {});

    // Enrich bookings with room names
    const enrichedBookings = bookingsData.map((booking) => {
      return {
        ...booking,
        roomName: roomNameMap[booking.spaces[0]] || "Unknown Room",
      };
    });

    const allBookings = [];
    enrichedBookings.slice(0, 1).forEach((booking) => {
      console.log("booking", booking);
      const parts = booking.recurrenceRule.split("\r\n");
      const standard = [parts[0], parts[2]];
      const joined = standard.join("\r\n");
      console.log("joined", joined);
      const rule = rrulestr(joined);
      const start = new Date(booking.start).getTime();
      const end = new Date(booking.end).getTime();
      const duration = end - start;
      let date = rule.options.dtstart;
      console.log("date", date);
      let count = 0;
      while (date && date <= rule.options.until && count < 100) {
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();
        const hour = date.getUTCHours();
        const minute = date.getUTCMinutes();
        const dt = datetime(year, month, day, hour, minute);
        console.log("dt", count, dt);
        const next = rule.after(dt);
        console.log("next", next);
        if (next) {
          const bookingEnd = new Date(next.getTime() + duration);
          const recurrence = {
            ...booking,
            start: next,
            end: bookingEnd,
          };
          allBookings.push(recurrence);
        }
        date = next;
        count += 1;
      }
    });

    const paramsEndDate = new Date(params.end);
    const paramsStartDate = new Date(params.start);

    const filteredBookings = allBookings.filter((booking) => {
      const bookingStart = new Date(booking.start);
      const bookingEnd = new Date(booking.end);
      const afterStart = bookingStart >= paramsStartDate;
      const beforeEnd = bookingEnd <= paramsEndDate;
      const inRange = afterStart && beforeEnd;
      return inRange;
    });

    res.json(filteredBookings);
  } catch (error) {
    console.error("Error fetching or processing data:", error.message);
    res.status(500).json({ error: "Failed to fetch or process data" });
  }
});

app.get("/events", async (req, res) => {
  const URL =
    "https://achieverooms.skedda.com/ical?k=eB-6EIgw0y8kUatcEd793SMsgYayCgku&i=574591";
  const response = await fetch(URL);
  const text = await response.text();
  console.log("text", text);
  const events = ICAL.parseICS(text);
  const eventCount = Object.keys(events).length;
  console.log("eventCount:", eventCount);
  const startDate = new Date(req.query.start);
  const end = new Date(req.query.end);
  end.setHours(23);
  end.setMinutes(59);
  end.setSeconds(59);
  const entries = Object.values(events);
  const filtered = entries.filter((entry) => {
    if (entry.type === "VEVENT") {
      return startDate <= new Date(entry.start) && end >= new Date(entry.start);
    }
  });
  console.log("filtered.length:", filtered.length);
  res.status(200).json(filtered);
});

const PORT = process.env.PORT || 4000; // Use the Azure-assigned port or fallback to 4000
const HOST = "0.0.0.0"; // Bind to all available interfaces

server.listen(PORT, HOST, () => {
  console.log(`Server is running on port ${PORT}`);
});
