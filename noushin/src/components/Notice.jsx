import Icon from "./Icon.jsx";

export default function Notice({ title, text }) {
  return (
    <div className="glass flex items-center gap-4 border-amber-400/30 bg-amber-400/5 p-4 text-[0.875rem]">
      <span className="icon-tile border-amber-400/30 bg-amber-400/10 text-amber-700">
        <Icon name="triangle-alert" />
      </span>
      <p>
        <b className="text-amber-800">{title}</b> <span className="text-ink/60">{text}</span>
      </p>
    </div>
  );
}
