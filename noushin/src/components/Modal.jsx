import { useEffect, useRef } from "react";

// A pop-up window built on the browser's <dialog> element.
// The parent decides when it is shown: render <Modal> to open it, stop rendering it to close it.
// onClose runs when the user presses Escape or clicks the dark backdrop.
export default function Modal({ onClose, wide = false, children }) {
  const dialogRef = useRef(null);

  // useRef gives us the real <dialog> element; once it is on the page we open it as a modal.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
  }, []);

  function handleCancel(event) {
    event.preventDefault(); // let React remove the dialog instead of the browser closing it
    onClose();
  }

  function handleBackdropClick(event) {
    if (event.target === dialogRef.current) onClose();
  }

  return (
    <dialog ref={dialogRef} className={`${wide ? "w-[min(640px,calc(100%-2rem))]" : "w-[min(480px,calc(100%-2rem))]"} max-h-[calc(100vh-2rem)] animate-rise-fast overflow-y-auto rounded-3xl border border-ink/15 bg-white/[.92] p-7 text-ink shadow-glass backdrop-blur-[24px] backdrop:bg-ink/25 backdrop:backdrop-blur-[4px]`} onCancel={handleCancel} onClick={handleBackdropClick}>
      {children}
    </dialog>
  );
}
