import Icon from "./Icon.jsx";

export default function FormField({ id, label, problem, aside = null, className = "", children }) {
  const checked = problem !== undefined;
  const hasProblem = Boolean(problem);
  const state = !checked ? undefined : hasProblem ? "error" : "ok";

  return (
    <div className={`group/field ${className}`} data-state={state}>
      {(label || aside) && (
        <div className="flex items-baseline justify-between">
          {label && (
            <label className="label" htmlFor={id}>
              {label}
            </label>
          )}
          {aside}
        </div>
      )}
      {children}
      {checked && (
        <p
          className={`mt-1.5 flex items-start gap-1.5 text-[0.75rem] leading-[1.3] ${hasProblem ? "text-red-600" : "text-forest"}`}
          aria-live="polite"
        >
          <Icon name={hasProblem ? "circle-alert" : "circle-check"} className="mt-px" />
          <span>{hasProblem ? problem : "Looks good"}</span>
        </p>
      )}
    </div>
  );
}
