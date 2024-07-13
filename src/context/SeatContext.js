// src/context/SeatContext.js
import React, { createContext, useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../config/firestore';

export const SeatContext = createContext();

export const SeatProvider = ({ children }) => {
  const [seats, setSeats] = useState([]);

  useEffect(() => {
    const getModulos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Modulos"));
        const seatsAvailable = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const moduleName = Object.keys(data)[0]; // Get the first key in the document
          return data[moduleName]; // Return the value (number of seats available)
        });
        setSeats(seatsAvailable);
      } catch (error) {
        console.error("Error fetching Modulos: ", error);
      }
    };
    getModulos();
  }, []);

  return (
    <SeatContext.Provider value={seats}>
      {children}
    </SeatContext.Provider>
  );
};
