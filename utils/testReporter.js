// utils/testReporter.js

const stepResults = [];

// =====================================
// Add Step Result
// =====================================

function addStepResult(
  step,
  status,
  details
) {

  stepResults.push({

    step,

    status,

    details,

  });

}

// =====================================
// Get Step Results
// =====================================

function getStepResults() {

  return stepResults;

}

// =====================================
// Clear Step Results
// =====================================

function clearStepResults() {

  stepResults.length = 0;

}

module.exports = {

  addStepResult,

  getStepResults,

  clearStepResults,

};