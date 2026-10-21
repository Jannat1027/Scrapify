import FormField from "./FormField.jsx";

// One labelled input connected to a form made with useFormValidation:
// it shows the form's value, reports changes and blurs, and shows that field's hint.
//   form: the object returned by useFormValidation
//   name: the field name (a key of the form's values and rules)
export default function FormInput({ form, name, label, id = name, type = "text", placeholder = "", autoComplete = "off", className = "" }) {
  return (
    <FormField id={id} label={label} problem={form.problems[name]} className={className}>
      <input
        id={id}
        name={name}
        type={type}
        min={type === "number" ? "0" : undefined}
        className="input"
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={form.values[name]}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
      />
    </FormField>
  );
}
