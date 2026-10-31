import { useState } from "react";
import Button from "./Button.jsx";
import ChoiceTile from "./ChoiceTile.jsx";
import Modal from "./Modal.jsx";

export default function ConfirmDialog({
  title,
  text = "",
  confirmLabel = "Confirm",
  danger = false,
  reasonPlaceholder = "",
  options = null,
  onConfirm,
  onClose,
}) {
  const [reason, setReason] = useState("");
  const [picked, setPicked] = useState(options ? options[options.length - 1] : "");
  const [problem, setProblem] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (reasonPlaceholder && reason.trim().length < 5) {
      setProblem("Add a few words so the other side understands.");
      return;
    }
    onClose();
    if (reasonPlaceholder) onConfirm(reason.trim());
    else if (options) onConfirm(picked);
    else onConfirm(true);
  }

  return (
    <Modal onClose={onClose}>
      <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
        <h2 className="text-[1.25rem] font-bold">{title}</h2>
        {text && <p className="text-sm text-ink/60">{text}</p>}

        {options && (
          <div className="grid grid-flow-col gap-2">
            {options.map((option) => (
              <ChoiceTile
                key={option}
                name="answer"
                value={option}
                checked={picked === option}
                onChange={() => setPicked(option)}
                label={option}
              />
            ))}
          </div>
        )}

        {reasonPlaceholder && (
          <div className="group/field" data-state={problem ? "error" : undefined}>
            <textarea
              className="input"
              placeholder={reasonPlaceholder}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              autoFocus
            />
            {problem && <p className="mt-1.5 flex items-start gap-1.5 text-[0.75rem] leading-[1.3] text-red-600">{problem}</p>}
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant={danger ? "danger" : "primary"}>
            {confirmLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
