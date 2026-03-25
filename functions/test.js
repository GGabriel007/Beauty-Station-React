require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { handler } = require('./index');

async function runTest() {
  try {
    // 1. Read the mock event data
    const mockEventPath = path.join(__dirname, 'mock-event.json');
    const mockEventRaw = fs.readFileSync(mockEventPath, 'utf8');
    const mockEvent = JSON.parse(mockEventRaw);

    console.log("=========================================");
    console.log("Starting Local Lambda Invocation Test...");
    console.log("=========================================\n");
    
    // 2. Invoke the Lambda handler
    const response = await handler(mockEvent);

    console.log("\n=========================================");
    console.log("Test Completed.");
    console.log("Lambda Response (if any/returned):", response);
    console.log("=========================================");
    
  } catch (error) {
    console.error("\nTest harness encountered an error:", error);
  }
}

// Execute the test harness
runTest();
