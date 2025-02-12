const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const WebSocket = require('ws');
const ICAL = require('ical')
const axios = require('axios');


const app = express();
const server = http.createServer(app); // Create an HTTP server using Express


app.use(cors({
  origin: '*',
}));

app.use (express.static('public'))

const skeddaHeaders = {
  'sec-ch-ua-platform': '"Windows"',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  'X-Skedda-RequestVerificationToken': 'CfDJ8KriP1kiUJ5Ntbart0Y2dC7ecmW76oBF4DIhA3f0Zd-HE7O0mqqFGGgs97jlKFKs3y_0XOuE67wFg_CdYAgqKr4q6kSSPBxm7AFMUCJC7Dl1Dii-LoUHyAQyxRwFn4i6TA1R__bnxoTV8wqqaOC2VFAN4bRg2lkipjGRwSFXpkdXzuH7i52Wnphgrupta4uaMw',
  'sec-ch-ua-mobile': '?0',
  'Accept': '*/*',
  'Sec-Fetch-Site': 'same-origin',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Dest': 'empty',
  'host': 'achieverooms.skedda.com',
  'Cookie': 'X-Skedda-RequestVerificationCookie=CfDJ8KriP1kiUJ5Ntbart0Y2dC5qmOcb-BhPMnSkX-T71WeyEDlSkdwfBTO-6ikFg_eSUDSfFDLdmxZCUCGaP05CB2tIS_w9wm-shfScREJqWg9JTynwElpdWBZoWjXSzKdsMHhqux1hIrLNmb6PTvla3qk; X-Skedda-ApplicationCookie=CfDJ8KriP1kiUJ5Ntbart0Y2dC6a1jgVgFs0VOV0qcLJEcmDJCoDzmky0TVWnjTKpAcA9qKM_gUXd2awpqxWVjdhnhirQG8U2FQshiHC1mQz-7NCD2ZnFsouUgmkPiO1MiUqk6BCR00R6HTEC3GgjV-SlOFDYy-xGoNeFLD3pEpNoyJhP34zsHyTLJou3ySdan86xvxA4uQhkHPs7v8iWcp0GwmukfLDogqNpPzN1ZOCHkqmnS9FbQGwkyvupDgJWejBEdbUMsEHZTneYcRA1C6H5vRmcfVEDz3ey4Cpr9B7EN1QgP8RJkgCIISh4lbL91JLM5UHTryyhji0P5DvUtm2c6n2nAxW8c_tIsTKXz1SIu24oXEsy3Q1fyXSKRzw7E9vtneW9C7YUjbw5EodQa92jopATdpgiVZb3DryoCbvgFBeButD9NzlHrFiwdQBEQSDd2p9uEOhzfhQ6FWa_f0tEhbSTMxX6IoBS57lkzuror_Mlv-gkt_CkY2aZyaQt8OGHCg9Ie18-aect-Ly0YoRu79PQ6LpfJxvRnECmKew-awqLEk-8m7XPaIIYhuK60fhQEu_uvcowjUn8L8dHMbF7n9FKKMrujIxlk-Dmn1tl_7p-IeB_y1URwNvBYtwgHyAKfylwKolZ6HIXyn3BkzOT0TfBEFUttnLMvr8v0ylvsI9LlqqO9AjZMmJjMPhEgAayvhR80EKRlMCiotqK9vV5RwXVHhaPHAkaDlGaGgO2ydwte9q30TyAAIcDJwX2y6xiCY-_bTdhpmoltEioszXtGjowS-uXLfYtiTsbzU2PEZa9XXCyyoEGJaDSMyfEMSwfA'
}

app.get('/bookings', async (req, res) => {
  const url = 'https://achieverooms.skedda.com/bookingslists';
  const params = {
      start: '2025-01-02T00:00:00',
      end: '2025-03-14T23:59:59.999'
  };

  try {
      const response = await axios.get(url, {
          params,
          headers: skeddaHeaders
      });

      res.json(response.data); // Forward the response data
  } catch (error) {
      console.error('Error fetching bookings:', error.message);
      res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});



app.get('/webs', async (req, res) => {
  const url = 'https://achieverooms.skedda.com/webs';

  try {
      const response = await axios.get(url, {
          headers: skeddaHeaders
      });

      res.json(response.data); // Forward the response data
  } catch (error) {
      console.error('Error fetching webs:', error.message);
      res.status(500).json({ error: 'Failed to fetch webs' });
  }
});




app.get('/events', async (req, res) => {
  const URL = "https://achieverooms.skedda.com/ical?k=eB-6EIgw0y8kUatcEd793SMsgYayCgku&i=574591"
  const response = await fetch(URL)
  const text = await response.text()
  const events = ICAL.parseICS(text)
  const eventCount = Object.keys(events).length
  console.log('eventCount:', eventCount)
  const startDate = new Date(req.query.start)
  const end = new Date(req.query.end)
  end.setHours(23)
  end.setMinutes(59)
  end.setSeconds(59)
  const entries = Object.values(events)
  const filtered = entries.filter((entry) => {
    if (entry.type === "VEVENT") {
      // return startDate <= (new Date(entry.start)) && end >= (new Date(entry.start))
      return true
    }
  })
  console.log('filtered.length:', filtered.length)
  res.status(200).json(filtered)

});

const PORT = process.env.PORT || 4000; // Use the Azure-assigned port  or  fallback to 4000
const HOST = '0.0.0.0'; // Bind to all available interfaces

server.listen(PORT, HOST, () => {
  console.log(`Server is running on port ${PORT}`);
});