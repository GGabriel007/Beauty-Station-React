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
          // Deep merge per course: hardcoded is the base for each course,
          // DB fields override field-by-field so hardcoded fills any gaps
          // (e.g. images.folder/count/instructor stay even if admin only saved price).
          const merged = { ...hardcodedCourses };
          for (const [id, dbCourse] of Object.entries(data)) {
            merged[id] = { ...(hardcodedCourses[id] || {}), ...dbCourse };
          }
          setCoursesData(merged);
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
