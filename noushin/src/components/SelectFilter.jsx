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
