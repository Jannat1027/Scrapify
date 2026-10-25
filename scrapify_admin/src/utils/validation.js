// Form validation used by the login, register and admin forms.
//
// A "rules" object lists, for each field, checks in order:
//   { email: [[isOk(value), "What to fix"], ...], password: [...] }
// The first check that fails gives the message shown under that field.

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

// Returns the problem message for one field, or "" when the value is fine.
export function findProblem(rules, fieldName, value) {
  const failedRule = rules[fieldName].find(([isOk]) => !isOk(value));
  return failedRule ? failedRule[1] : "";
}

// Checks every field. Returns { fieldName: "problem" } with only the fields that have problems.
export function validateAll(rules, values) {
  const problems = {};
  for (const fieldName of Object.keys(rules)) {
    const problem = findProblem(rules, fieldName, values[fieldName]);
    if (problem) problems[fieldName] = problem;
  }
  return problems;
}
