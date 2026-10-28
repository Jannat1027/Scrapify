// A dropdown filter. The first option ("All plastic types", "Any condition" ...) means "no filter".
//   options: rows with an id and a name (like data.categories), or plain text (like data.locations)
//   onChange: receives the change event, like a normal <select>
export default function SelectFilter({ name, value, onChange, allLabel, options }) {
  return (
    <select name={name} className="input" value={value} onChange={onChange}>
      <option value="">{allLabel}</option>
      {options.map((option) => {
        const optionValue = typeof option === "string" ? option : option.id;
        const optionLabel = typeof option === "string" ? option : option.name;
        return (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        );
      })}
    </select>
  );
}
