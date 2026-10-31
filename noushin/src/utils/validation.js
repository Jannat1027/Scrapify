export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function findProblem(rules, fieldName, value) {
  const failedRule = rules[fieldName].find(([isOk]) => !isOk(value));
  return failedRule ? failedRule[1] : "";
}

export function validateAll(rules, values) {
  const problems = {};
  for (const fieldName of Object.keys(rules)) {
    const problem = findProblem(rules, fieldName, values[fieldName]);
    if (problem) problems[fieldName] = problem;
  }
  return problems;
}
