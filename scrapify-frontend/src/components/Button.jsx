import Icon from "./Icon.jsx";

// A styled <button>.
//   variant: "primary" (green), "danger" (red), "ghost" (no border) or leave empty for the plain white button
//   size:    "sm", "lg" or leave empty
//   icon:    optional icon name shown before the text
// Any other prop (onClick, type, disabled ...) is passed straight to the <button>.
// Class names are written out in full so Tailwind keeps them in the build.
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
