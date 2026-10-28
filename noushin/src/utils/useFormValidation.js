// A custom hook (a function that uses other hooks) shared by every form with validation.
// It keeps the typed values and the "what to fix" message for each field.
//
// Behaviour (kept from the original site):
//   - a field is checked when the user leaves it (blur), if something was typed
//   - after that, it is re-checked on every keystroke until it is fixed
//   - on submit, every field is checked and the first wrong one gets focus
import { useState } from "react";
import { findProblem, validateAll } from "./validation.js";

function cleanValue(value) {
  return typeof value === "string" ? value.trim() : value;
}

export function useFormValidation(rules, initialValues) {
  const [values, setValues] = useState(initialValues);
  // { fieldName: "" } means checked and fine; { fieldName: "message" } means it needs fixing.
  const [problems, setProblems] = useState({});

  function checkField(name, value) {
    if (!rules[name]) return;
    setProblems((old) => ({ ...old, [name]: findProblem(rules, name, cleanValue(value)) }));
  }

  function handleChange(event) {
    const { name, type, checked, value, tagName } = event.target;
    const newValue = type === "checkbox" ? checked : value;
    setValues((old) => ({ ...old, [name]: newValue }));

    // Checkboxes and dropdowns are checked straight away; text fields only once already checked.
    const checkNow = type === "checkbox" || type === "radio" || tagName === "SELECT" || name in problems;
    if (checkNow) checkField(name, newValue);
  }

  // The hint is shown a moment later: showing it at once moves the fields below it down,
  // and a click the user is in the middle of (e.g. on the terms checkbox) would miss its target.
  function handleBlur(event) {
    const { name, value } = event.target;
    if (value !== "") setTimeout(() => checkField(name, value), 200);
  }

  // Checks every field. Returns true when the whole form is fine.
  function validateForm() {
    const cleanValues = {};
    Object.keys(values).forEach((name) => (cleanValues[name] = cleanValue(values[name])));
    const found = validateAll(rules, cleanValues);

    const allProblems = {};
    Object.keys(rules).forEach((name) => (allProblems[name] = found[name] || ""));
    setProblems(allProblems);

    const firstWrongField = Object.keys(rules).find((name) => found[name]);
    if (firstWrongField) document.getElementsByName(firstWrongField)[0]?.focus();
    return !firstWrongField;
  }

  // For problems only found after submitting, like "No account uses this email".
  function setFieldProblem(name, message) {
    setProblems((old) => ({ ...old, [name]: message }));
    document.getElementsByName(name)[0]?.focus();
  }

  // Back to the starting values with no messages.
  function resetForm() {
    setValues(initialValues);
    setProblems({});
  }

  return { values, setValues, problems, handleChange, handleBlur, validateForm, setFieldProblem, resetForm };
}
