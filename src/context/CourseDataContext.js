// src/context/CourseDataContext.js
//
// Fetches course data from the CourseSettings DynamoDB table via the /courses API
// endpoint and makes it available to the whole component tree.
//
// Falls back to the hardcoded courseData.js if the table hasn't been seeded yet
// or if the network request fails — ensuring zero regression during Phase 1.

import React, { createContext, useContext, useState, useEffect } from 'react';
import { get } from 'aws-amplify/api';
import { coursesInfo as hardcodedCourses } from '../config/courseData';

const CourseDataContext = createContext(hardcodedCourses);

export function CourseDataProvider({ children }) {
  const [coursesData, setCoursesData] = useState(hardcodedCourses);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const restOp = get({ apiName: 'checkoutApi', path: '/courses' });
        const { body } = await restOp.response;
        const data = await body.json();

        // Only replace if we got a non-empty valid object back
        if (data && typeof data === 'object' && !data.error && Object.keys(data).length > 0) {
          // Merge: DB data wins over hardcoded, but hardcoded fills any gaps
          setCoursesData({ ...hardcodedCourses, ...data });
        }
      } catch (err) {
        // Table not seeded yet or network error — silently keep hardcoded data
        console.info('[CourseDataContext] Using hardcoded course data:', err.message);
      }
    }
    fetchCourses();
  }, []);

  return (
    <CourseDataContext.Provider value={coursesData}>
      {children}
    </CourseDataContext.Provider>
  );
}

export function useCourseData() {
  return useContext(CourseDataContext);
}
