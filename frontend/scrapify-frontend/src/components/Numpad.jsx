const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

export default function Numpad({ text, onChange }) {
  function pressKey(key) {
    if (key === "⌫") {
      onChange(text.slice(0, -1));
      return;
    }
    const tooLong = text.length >= 6;
    const secondDot = key === "." && text.includes(".");
    if (!tooLong && !secondDot) onChange(text + key);
  }

  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {KEYS.map((key) => (
        <button key={key} type="button" className="btn h-16 rounded-2xl text-[1.5rem]" onClick={() => pressKey(key)} aria-label={key === "⌫" ? "Delete" : key}>
          {key}
        </button>
      ))}
    </div>
  );
}
