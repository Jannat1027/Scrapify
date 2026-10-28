import Icon from "./Icon.jsx";

export default function EmptyState({ icon = "inbox", text, inGlass = false }) {
  const content = (
    <div className="grid place-items-center gap-3 px-4 py-14 text-center text-ink/60">
      <Icon name={icon} size={40} className="text-ink/30" />
      <p>{text}</p>
    </div>
  );
  return inGlass ? <div className="glass col-span-full">{content}</div> : content;
}
