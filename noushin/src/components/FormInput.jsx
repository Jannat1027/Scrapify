import FormField from "./FormField.jsx";

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
