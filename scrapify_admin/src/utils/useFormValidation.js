import { useState } from "react";
import { findProblem, validateAll } from "./validation.js";

function cleanValue(value) {
  return typeof value === "string" ? value.trim() : value;
}

export function useFormValidation(rules, initialValues) {
  const [values, setValues] = useState(initialValues);
  const [problems, setProblems] = useState({});

  function checkField(name, value) {
    if (!rules[name]) return;
    setProblems((old) => ({ ...old, [name]: findProblem(rules, name, cleanValue(value)) }));
  }

  function handleChange(event) {
    const { name, type, checked, value, tagName } = event.target;
    const newValue = type === "checkbox" ? checked : value;
    setValues((old) => ({ ...old, [name]: newValue }));

    const checkNow = type === "checkbox" || type === "radio" || tagName === "SELECT" || name in problems;
    if (checkNow) checkField(name, newValue);
  }

  function handleBlur(event) {
    const { name, value } = event.target;
    if (value !== "") setTimeout(() => checkField(name, value), 200);
  }

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

  function setFieldProblem(name, message) {
    setProblems((old) => ({ ...old, [name]: message }));
    document.getElementsByName(name)[0]?.focus();
  }

  function resetForm() {
    setValues(initialValues);
    setProblems({});
  }

  return { values, setValues, problems, handleChange, handleBlur, validateForm, setFieldProblem, resetForm };
}
