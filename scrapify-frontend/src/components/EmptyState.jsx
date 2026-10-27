import Icon from "./Icon.jsx";

// Shown instead of a list or table when there is nothing to show.
// Set inGlass to put it on its own frosted panel (used in card grids).
export default function EmptyState({ icon = "inbox", text, inGlass = false }) {
  const content = (
    <div className="grid place-items-center gap-3 px-4 py-14 text-center text-ink/60">
      <Icon name={icon} size={40} className="text-ink/30" />
      <p>{text}</p>
    </div>
  );
  return inGlass ? <div className="glass col-span-full">{content}</div> : content;
}
