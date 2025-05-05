import React, { useEffect, useState } from "react";
import { Button, TextField, Typography, MenuItem, Select, FormControl, InputLabel, Paper } from "@mui/material";



export const getAllRecords = (dbInstance, storeName) => {
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction([storeName], "readonly");
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.getAll();

    request.onsuccess = (event) => {
      console.log(`All records from ${storeName}:`, event.target.result);
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};



export const initializeDatabase = (request, setDb) => {
  request.onupgradeneeded = (event) => {
    const deleteRequest = indexedDB.deleteDatabase("testDB");

    deleteRequest.onsuccess = () => {
        console.log("Database deleted successfully");

        const request = indexedDB.open("testDB", 30);

        request.onsuccess = (event) => {
            const dbInstance = event.target.result;
            setDb(dbInstance);
            console.log("Database initialized");
            getAllRecords(dbInstance);
        };

        request.onerror = (event) => {
            console.error("Error initializing database:", event.target.error);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains("users")) {
                const objectStore = db.createObjectStore("users", { keyPath: "id" });
                objectStore.createIndex("adminUser", "adminUser", { unique: false });

                objectStore.add({ id: 1, admin: "seichenbaum@achievebh.org" });
                objectStore.add({ id: 2, admin: "Areiner@achievebbh.org" });
                objectStore.add({ id: 3, admin: "jfrohlich@achievebh.org" });
                objectStore.add({ id: 4, admin: "chager@achievebh.org" });
                objectStore.add({ id: 5, admin: "nkutin@achievebh.org" });
                objectStore.add({ id: 6, admin: "ozharnest@achievebh.org" });
                objectStore.add({ id: 7, admin: "mgalla@achievebh.org" });
                objectStore.add({ id: 8, admin: "ygenack@achievebh.org" });
                objectStore.add({ id: 9, admin: "jweiss@achievebh.org" });
                objectStore.add({ id: 10, admin: "bmayer@achievebh.org" });
                objectStore.add({ id: 11, admin: "rashkenas@achievebh.org" });
                objectStore.add({ id: 12, admin: "yedidagenack@achievebh.org" });
                objectStore.add({ id: 13, admin: "tschiller@achievebh.org" });
                objectStore.add({ id: 14, admin: "ylichter@achievebh.org" });
                objectStore.add({ id: 15, admin: "smarkowitz@achievebh.org" });
                objectStore.add({ id: 16, admin: "ynissenfeld@achievebh.org" });
                objectStore.add({ id: 17, admin: "mgrunfeld@achievebh.org" });
                objectStore.add({ id: 18, admin: "ychesner@achievebh.org" });
                objectStore.add({ id: 19, admin: "yhalle@achievebh.org" });
                objectStore.add({ id: 20, admin: "ahirschfeld@achievebh.org" });
                objectStore.add({ id: 21, admin: "mbineth@achievebh.org" });
                objectStore.add({ id: 22, admin: "mplattie@achievebh.org" });
                objectStore.add({ id: 23, admin: "ghoffnung@achievebh.org" });
                objectStore.add({ id: 24, admin: "ylunger@achievebh.org" });
                objectStore.add({ id: 25, admin: "jbaumhaft@achievebh.org" });

                console.log("Admins added to the 'users' object store");
            }

            if (!db.objectStoreNames.contains("supervisor")) {
                const supervisorStore = db.createObjectStore("supervisor", { keyPath: "id" });
                supervisorStore.createIndex("name", "name", { unique: false });

                supervisorStore.add({ id: 1, name: "ebitter@achievebh.org" });
                supervisorStore.add({ id: 2, name: "csgeldzahler@achievebh.org" });
                supervisorStore.add({ id: 3, name: "mbleicher@achievebh.org" });
                supervisorStore.add({ id: 4, name: "ccohen@achievebh.org" });
                supervisorStore.add({ id: 5, name: "zsafran@achievebh.org" });
                supervisorStore.add({ id: 6, name: "ykrakowski@achievebh.org" });

                console.log("Supervisors added to the 'supervisor' object store");
            }

            if (!db.objectStoreNames.contains("resources")) {
                const objectStore = db.createObjectStore("resources", { keyPath: "idd", autoIncrement: true });
                objectStore.createIndex("id", "id", { unique: true });
                objectStore.createIndex("roomname", "roomname", { unique: false });
                objectStore.createIndex("location", "location", { unique: false });
                objectStore.createIndex("purpose", "purpose", { unique: false });
                objectStore.createIndex("ClinicalSpace", "ClinicalSpace", { unique: false });

                    
     
          objectStore.add({ "name": "RP - ADMIN","id": "RP - ADMIN","location": "RP","purpose": "","ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -01","id": "RP -01","location": "RP","purpose": "",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -02 - Conference Room","id": "RP -02 - Conference Room","location": "RP","purpose": "Conference Room",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -03","id": "RP -03","location": "RP","purpose": "",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -05","id": "RP -05","location": "RP","purpose": "Couple",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -06","id": "RP -06","location": "RP","purpose": "",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -07","id": "RP -07","location": "RP","purpose": "Couple",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -08","id": "RP -08","location": "RP","purpose": "",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -09 - Playroom","id": "RP -09 - Playroom","location": "RP","purpose": "Playroom",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -10","id": "RP -10","location": "RP","purpose": "",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -11 - Dr. Galla","id": "RP -11 - Dr. Galla","location": "RP","purpose": "",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -12","id": "RP -12","location": "RP","purpose": "",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -13","id": "RP - 13","location": "RP","purpose": "",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -14","id": "RP -14","location": "RP","purpose": "",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -15 - Nurse","id": "RP -15 - Nurse","location": "RP","purpose": "",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -16","id": "RP -16","location": "RP","purpose": "",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -17 - Playroom","id": "RP -17 - Playroom","location": "RP","purpose": "Playroom",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -18","id": "RP -18","location": "RP","purpose": "",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -19 - Playroom","id": "RP -19 - Playroom","location": "RP","purpose": "Playroom",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -20 - Playroom","id": "RP -20 - Playroom","location": "RP","purpose": "Playroom",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -22","id": "RP -22","location": "RP","purpose": "",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -23","id": "RP -23","location": "RP","purpose": "",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -24","id": "RP -24","location": "RP","purpose": "",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -25","id": "RP -25","location": "RP","purpose": "",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -26","id": "RP -26","location": "RP","purpose": "",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -27 - Nurse","id": "RP -27 - Nurse","location": "RP","purpose": "",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -28 - Dr. Nissenfeld","id": "RP -28 - Dr. Nissenfeld","location": "RP","purpose": "",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "RP -29 - Sm Conf Rm","id": "RP -29 - Sm Conf Rm","location": "RP","purpose": "Conference Room",  "ClinicalSpace": "RP"})
          objectStore.add({ "name": "Airmont - 01","id": "Airmont - 01","location": "Airmont","purpose": "", "ClinicalSpace": "Airmont"})
          objectStore.add({ "name": "Airmont - 02","id": "Airmont - 02","location": "Airmont","purpose": "Couple",  "ClinicalSpace": "Airmont"})
          objectStore.add({ "name": "Airmont - 03","id": "Airmont - 03","location": "Airmont","purpose": "Couple","ClinicalSpace": "Airmont"})
          objectStore.add({ "name": "Airmont - 04","id": "Airmont - 04","location": "Airmont","purpose": "Couple","ClinicalSpace": "Airmont"})
          objectStore.add({ "name": "Airmont - 05 Playroom","id": "Airmont - 05 Playroom","location": "Airmont","purpose": "Playroom","ClinicalSpace": "Airmont"})
          objectStore.add({ "name": "Airmont - 06","id": "Airmont - 06","location": "Airmont","purpose": "","ClinicalSpace": "Airmont"})
          objectStore.add({ "name": "Airmont - 07 Playroom","id": "Airmont - 07 Playroom","location": "Airmont","purpose": "Playroom","ClinicalSpace": "Airmont"})
          objectStore.add({ "name": "Airmont - 08","id": "Airmont - 08","location": "Airmont","purpose": "","ClinicalSpace": "Airmont"})
          objectStore.add({ "name": "Airmont - 09  Playroom","id": "Airmont - 09  Playroom","location": "Airmont","purpose": "Playroom","ClinicalSpace": "Airmont"})
          objectStore.add({ "name": "Airmont - 11","id": "Airmont - 11","location": "Airmont","purpose": "","ClinicalSpace": "Airmont"})
          objectStore.add({ "name": "Airmont - 12","id": "Airmont - 12","location": "Airmont","purpose": "Couple","ClinicalSpace": "Airmont"})
          objectStore.add({ "name": "Airmont - 13","id": "Airmont - 13","location": "Airmont","purpose": "Couple","ClinicalSpace": "Airmont"})
          objectStore.add({ "name": "Airmont - 14","id": "Airmont - 14","location": "Airmont","purpose": "Couple",  "ClinicalSpace": "Airmont"})
          objectStore.add({ "name": "Airmont - 15","id": "Airmont - 15","location": "Airmont","purpose": "","ClinicalSpace": "Airmont"})
          objectStore.add({ "name": "Airmont - 16","id": "Airmont - 16","location": "Airmont","purpose": "","ClinicalSpace": "Airmont"})
          objectStore.add({ "name": "Airmont - 17 (R. Reiner)","id": "Airmont - 17 (R. Reiner)","location": "Airmont","purpose": "","ClinicalSpace": "Airmont"})
          objectStore.add({ "name": "Airmont - 18 (Staff Rm)","id": "Airmont - 18 (Staff Rm)","location": "Airmont","purpose": "","ClinicalSpace": "Airmont"})
          objectStore.add({ "name": "CC-00 (Small Conference Room)","id": "CC-00 (Small Conference Room)","location": "CC","purpose": "Conference Room","ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-01 (Art Room)","id": "CC-01 (Art Room)","location": "CC","purpose": "","ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-02-  Green","id": "CC-02-  Green","location": "CC","purpose": "",  "ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-03- Purple","id": "CC-03- Purple","location": "CC","purpose": "",  "ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-04- Orange","id": "CC-04- Orange","location": "CC","purpose": "","ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-05- Blue","id": "CC-05- Blue","location": "CC","purpose": "","ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-06- Yellow","id": "CC-06- Yellow","location": "CC","purpose": "","ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-07 - Orange","id": "CC-07 - Orange","location": "CC","purpose": "","ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-08 - Blue","id": "CC-08 - Blue","location": "CC","purpose": "",  "ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-09 - Nurse - Green","id": "CC-09 - Nurse - Green","location": "CC","purpose": "",  "ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-10 - Blue","id": "CC-10 - Blue","location": "CC","purpose": "","ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-11 - Dr. Genack","id": "CC-11 - Dr. Genack","location": "CC","purpose": "",  "ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-12- Dr. Frohlich","id": "CC-12- Dr. Frohlich","location": "CC","purpose": "","ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-13 - YELLOW","id": "CC-13 - Yellow","location": "CC","purpose": "",  "ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-14 - Purple","id": "CC-14 - Purple","location": "CC","purpose": "",  "ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-15 - Green","id": "CC-15 - Green","location": "CC","purpose": "Couple",  "ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-16 - Blue","id": "CC-16 - Blue","location": "CC","purpose": "Couple",  "ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-17 - Orange","id": "CC-17 - Orange","location": "CC","purpose": "",  "ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-21 - Conference Room","id": "CC-21 - Conference Room","location": "CC","purpose": "Conference Room",  "ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-22- Orange","id": "CC-22- Orange","location": "CC","purpose": "",  "ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-23 - Blue","id": "CC-23 - Blue","location": "CC","purpose": "",  "ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-24","id": "CC-24","location": "CC","purpose": "Couple",  "ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-25 - Ezer Bachurim","id": "CC-25 - Ezer Bachurim","location": "CC","purpose": "",  "ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-26","id": "CC-26","location": "CC","purpose": "",  "ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-27","id": "CC-27","location": "CC","purpose": "Couple",  "ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-28","id": "CC-28","location": "CC","purpose": "",  "ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-30 - Playroom","id": "CC-30 - Playroom","location": "CC","purpose": "Playroom","ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-31","id": "CC-31","location": "CC","purpose": "", "ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-32 - Ezer Bachurim","id": "CC-32 - Ezer Bachurim","location": "CC","purpose": "", "ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-33","id": "CC-33","location": "CC","purpose": "", "ClinicalSpace": "CC"})
          objectStore.add({ "name": "CC-34 - Playroom","id": "CC-34 - Playroom", "location": "CC","purpose": "Playroom","ClinicalSpace": "CC"})
          objectStore.add({ "name": "2 MPD Conference Room","id": "2 MPD Conference Room","location": "2 MPD","purpose": "Conference Room"})
          objectStore.add({ "name": "2 MPD Rm 1","id": "2 MPD Rm 1","location": "2 MPD","purpose": ""})
          objectStore.add({ "name": "2 MPD Rm 2 - Purple","id": "2 MPD Rm 2 - Purple","location": "2 MPD","purpose": "","ClinicalSpace": "" })   
          objectStore.add({ "name": "2 MPD Rm 3 - Green","id": "2 MPD Rm 3 - Green","location": "2 MPD","purpose": ""})
          objectStore.add({ "name": "2 MPD Rm 4 - Orange","id": "2 MPD Rm 4 - Orange","location": "2 MPD","purpose": ""})
          objectStore.add({ "name": "2 MPD GYM","id": "2 MPD GYM","location": "2 MPD","purpose": ""})
          objectStore.add({ "name": "21 RPD Conference Room","id": "21 RPD Conference Room","location": "RPD","purpose": "Conference Room"})
          objectStore.add({ "name": "WC Rm 1","id": "WC Rm 1","location": "WC","purpose": ""})
          objectStore.add({ "name": "WC Rm 2","id": "WC Rm 2","location": "WC","purpose": ""})
          objectStore.add({ "name": "WC Rm 3","id": "WC Rm 3","location": "WC","purpose": ""})
          objectStore.add({ "name": "WC Rm 4","id": "WC Rm 4","location": "WC","purpose": ""})
          objectStore.add({ "name": "WC Rm 5","id": "WC Rm 5","location": "WC","purpose": ""})
          objectStore.add({ "name": "WC Rm 6","id": "WC Rm 6","location": "WC","purpose": ""})
          objectStore.add({ "name": "WC Rm 7","id": "WC Rm 7","location": "WC","purpose": ""})
          objectStore.add({ "name": "WC  Staff Rm","id": "WC  Staff Rm","location": "WC","purpose": ""})
          objectStore.add({ "name": "WC Basement Main","id": "WC Basement Main","location": "WC","purpose": ""})
          objectStore.add({ "name": "SRR Rm 1","id": "SRR Rm 1","location": "SRR","purpose": ""})
          objectStore.add({ "name": "SRR Rm 2","id": "SRR Rm 2","location": "SRR","purpose": ""})
          objectStore.add({ "name": "SRR Rm 3","id": "SRR Rm 3","location": "SRR","purpose": ""})
          objectStore.add({ "name": "SRR Rm 4","id": "SRR Rm 4","location": "SRR","purpose": ""})
          objectStore.add({ "name": "SRR Rm 5","id": "SRR Rm 5","location": "SRR","purpose": ""})
          objectStore.add({ "name": "SRR RM 6","id": "SRR RM 6","location": "SRR","purpose": ""})
          objectStore.add({ "name": "SRR Multipurpose Room","id": "SRR Multipurpose Room","location": "SRR","purpose": ""})
          objectStore.add({ "name": "SRR Conference Room","id": "SRR Conference Room","location": "SRR","purpose": ""})
          objectStore.add({ "name": "SRR Group Room","id": "SRR Group Room","location": "SRR","purpose": "",})
          objectStore.add({ "name": "SRR Work Center","id": "SRR Work Center","location": "SRR","purpose": "",})
          objectStore.add({ "name": "M 3601 - Playroom","id": "M 3601 - Playroom","location": "M","purpose": "Playroom",  "ClinicalSpace": "M"})
          objectStore.add({ "name": "M 3602","id": "M 3602","location": "M","purpose": "",  "ClinicalSpace": "M"})
          objectStore.add({ "name": "M 3603","id": "M 3603","location": "M","purpose": "",  "ClinicalSpace": "M"})
          objectStore.add({ "name": "M 3604","id": "M 3604","location": "M","purpose": "",  "ClinicalSpace": "M"})
          objectStore.add({ "name": "M 3605","id": "M 3605","location": "M","purpose": "",  "ClinicalSpace": "M"})
          objectStore.add({ "name": "M 3606","id": "M 3606","location": "M","purpose": "",  "ClinicalSpace": "M"})
          objectStore.add({ "name": "M 3607  - Nurse","id": "M 3607  - Nurse","location": "M","purpose": "",  "ClinicalSpace": "M"})
          objectStore.add({ "name": "M 3608","id": "M 3608","location": "M","purpose": "",  "ClinicalSpace": "M"})
          objectStore.add({ "name": "M 3609 - Playroom","id": "M 3609 - Playroom","location": "M","purpose": "Playroom",  "ClinicalSpace": "M"})
          objectStore.add({ "name": "M 3610","id": "M 3610","location": "M","purpose": "",  "ClinicalSpace": "M"})
          objectStore.add({ "name": "M 3611 - Playroom","id": "M 3611 - Playroom","location": "M","purpose": "Playroom",  "ClinicalSpace": "M"})
          objectStore.add({ "name": "M 3612","id": "M 3612","location": "M","purpose": "",  "ClinicalSpace": "M"})
          objectStore.add({ "name": "M 3613","id": "M 3613","location": "M","purpose": "",  "ClinicalSpace": "M"})
          objectStore.add({ "name": "M 3615","id": "M 3615","location": "M","purpose": "",  "ClinicalSpace": "M"})
          objectStore.add({ "name": "M 3616 - Conf","id": "M 3616 - Conf","location": "M","purpose": "Conference Room",  "ClinicalSpace": "M"})
          objectStore.add({ "name": "M 3617 (70 Gilbert)","id": "M 3617 (70 Gilbert)","location": "M","purpose": "",  "ClinicalSpace": "M"})
          objectStore.add({ "name": "M 3618 (70 Gilbert)","id": "M 3618 (70 Gilbert)","location": "M","purpose": "",  "ClinicalSpace": "M"})
          objectStore.add({ "name": "M 3619 (70 Gilbert)","id": "M 3619 (70 Gilbert)","location": "M","purpose": "",  "ClinicalSpace": "M"})
          objectStore.add({ "name": "M 3620 (70 Gilbert)","id": "M 3620 (70 Gilbert)","location": "M","purpose": "",  "ClinicalSpace": "M"})
          objectStore.add({ "name": "950-05 - Dr. Mayer","id": "950-05 - Dr. Mayer","location": "","purpose": "","ClinicalSpace": "950-05"})
          objectStore.add({ "name": "950-03","id": "950-03","location": "","purpose": "","ClinicalSpace": "950-03"})
          objectStore.add({ "name": "950-04 - Nurse","id": "950-04 - Nurse","location": "","purpose": "","ClinicalSpace": "950-04"})
          objectStore.add({ "name": "950-07","id": "950-07","location": "","purpose": "","ClinicalSpace": "950-07"})
          objectStore.add({ "name": "950-08","id": "950-08","location": "","purpose": ""})
          objectStore.add({ "name": "950-09","id": "950-09","location": "","purpose": ""})
          objectStore.add({ "name": "950-10","id": "950-10","location": "","purpose": ""})
           
       
  



                console.log("Resources added to the 'resources' object store");
            }

            console.log("Object stores created successfully");
        };
    };

    deleteRequest.onerror = (event) => {
        console.error("Error deleting database:", event.target.error);
    };
  };

  request.onsuccess = (event) => {
    const dbInstance = event.target.result;
    setDb(dbInstance); // Update the state with the database instance
    console.log("Database initialized");






  };

  request.onerror = (event) => {
    console.error("Error initializing database:", event.target.error);
  };
};









const Database = () => {


  const [db, setDb] = useState(null);
  const [formData, setformData] = useState({ admin: "", action: "add", store: "users" });  

  useEffect(() => {
    const request = indexedDB.open("testDB", 19);
    initializeDatabase(request, setDb); // Pass setDb to initializeDatabase
  }, []);

  const addToDB = (db, store, admin) => {
    if (!db) {
      console.error("Database is not initialized");
      return;
    }

    const transaction = db.transaction(store, "readwrite");
    const objectStore = transaction.objectStore(store);

    const getAllRequest = objectStore.getAll();

    getAllRequest.onsuccess = () => {
      const allRecords = getAllRequest.result;
      const lastId = allRecords.length > 0 ? Math.max(...allRecords.map((record) => record.id)) : 0;
      const newId = lastId + 1;

      const newRecord = store === "users" ? { id: newId, admin } : { id: newId, name: admin };
      const addRequest = objectStore.add(newRecord);

      addRequest.onsuccess = () => {
        console.log(`${store === "users" ? "Admin" : "Supervisor"} added successfully:`, newRecord);
      };

      addRequest.onerror = (event) => {
        console.error(`Error adding to ${store}:`, event.target.error);
      };
    };

    getAllRequest.onerror = (event) => {
      console.error(`Error retrieving records from ${store}:`, event.target.error);
    };
  };



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setformData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleActionChange = (e) => {
    setformData((prevFormData) => ({
      ...prevFormData,
      action: e.target.value,
    }));
  };

  const handleStoreChange = (e) => {
    setformData((prevFormData) => ({
      ...prevFormData,
      store: e.target.value,
    }));
  };




  const deleteFromDB = (db, store, admin) => {
    if (!db) {
      console.error("Database is not initialized");
      return;
    }

    const transaction = db.transaction(store, "readwrite");
    const objectStore = transaction.objectStore(store);

    const getAllRequest = objectStore.getAll();

    getAllRequest.onsuccess = () => {
      const allRecords = getAllRequest.result;
      const recordToDelete = store === "users"
        ? allRecords.find((record) => record.admin === admin)
        : allRecords.find((record) => record.name === admin);

      if (recordToDelete) {
        const deleteRequest = objectStore.delete(recordToDelete.id);

        deleteRequest.onsuccess = () => {
          console.log(`${store === "users" ? "Admin" : "Supervisor"} with name ${admin} deleted successfully.`);
        };

        deleteRequest.onerror = (event) => {
          console.error(`Error deleting from ${store}:`, event.target.error);
        };
      } else {
        console.error(`${store === "users" ? "Admin" : "Supervisor"} with name ${admin} not found.`);
      }
    };

    getAllRequest.onerror = (event) => {
      console.error(`Error retrieving records from ${store}:`, event.target.error);
    };
  };



  const handleAddUser = () => {
    if (!db) {
      console.error("Database is not initialized");
      return;
    }

    const { user } = formData;

    if (!user) {
      console.error("User field is required");
      return;
    }

    addToDB(db, user);
    setformData({ user: "", deleteUser: "" }); // Reset form
    getAllRecords(db);
  };

  const handleDeleteUser = () => {
    if (!db) {
      console.error("Database is not initialized");
      return;
    }

    const { deleteUser } = formData;

    if (!deleteUser) {
      console.error("Delete User field is required");
      return;
    }

    deleteFromDB(db, deleteUser);
    setformData({ user: "", deleteUser: "" }); // Reset form
    getAllRecords(db);
  };


  const handleSubmit = () => {
    if (!db) {
      console.error("Database is not initialized");
      return;
    }
  
    const { admin, action, store } = formData;
  
    if (!admin) {
      console.error("Admin/Supervisor field is required");
      return;
    }
  
    if (action === "add") {
      addToDB(db, store, admin); // Ensure 'store' is either 'users' or 'supervisor'
    } else if (action === "delete") {
      deleteFromDB(db, store, admin);
    }
  
    setformData({ admin: "", action: "add", store: "users" });
  };


  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 400,
        margin: "auto",
        padding: 3,
        borderRadius: 2,
        boxShadow: 4,
      }}
    >
      <Typography variant="h5" gutterBottom align="center">
      Admin/Supervisor Management
      </Typography>

      {/* Action Selector */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Action</InputLabel>
        <Select
          value={formData.action}
          onChange={handleActionChange}
          label="Action"
        >
          <MenuItem value="add">Add</MenuItem>
          <MenuItem value="delete">Delete</MenuItem>
        </Select>
      </FormControl>

      {/* Store Selector */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Users</InputLabel>
        <Select
          value={formData.store}
          onChange={handleStoreChange}
          label="Store"
        >
          <MenuItem value="users">Admin</MenuItem>
          <MenuItem value="supervisor">Supervisors</MenuItem>
        </Select>
      </FormControl>

      {/* Admin/Supervisor Input Field */}
      <TextField
        fullWidth
        label="Admin/Supervisor Name"
        name="admin"
        value={formData.admin}
        onChange={handleInputChange}
        margin="normal"
        variant="outlined"
      />

      {/* Submit Button */}
      <Button
        variant="contained"
        color={formData.action === "add" ? "primary" : "error"}
        fullWidth
        onClick={handleSubmit}
        sx={{ mt: 2 }}
      >
        {formData.action === "add" ? "Add" : "Delete"}
      </Button>
    </Paper>
  );
};

export default Database;
