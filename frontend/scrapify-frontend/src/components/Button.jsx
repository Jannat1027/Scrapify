import Icon from "./Icon.jsx";

const VARIANT_CLASSES = { primary: "btn-primary", danger: "btn-danger", ghost: "btn-ghost" };
const SIZE_CLASSES = { sm: "btn-sm", lg: "btn-lg" };

export default function Button({ variant = "", size = "", icon = "", className = "", children, ...otherProps }) {
  const classes = ["btn", VARIANT_CLASSES[variant], SIZE_CLASSES[size], className].filter(Boolean).join(" ");
  return (
    <button type="button" className={classes} {...otherProps}>
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}
