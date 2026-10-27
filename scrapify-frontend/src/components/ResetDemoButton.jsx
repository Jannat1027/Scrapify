import { useState } from "react";
import { useData } from "../context/DataContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Button from "./Button.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";

// Puts all demo data back to what src/data/seed.js says. Handy before showing the app to someone.
export default function ResetDemoButton({ className = "" }) {
  const { resetDemoData } = useData();
  const showToast = useToast();
  const [asking, setAsking] = useState(false);

  function handleConfirm() {
    resetDemoData();
    showToast("Demo data restored.");
  }

  return (
    <>
      <Button size="sm" icon="rotate-ccw" className={className} onClick={() => setAsking(true)}>
        Reset demo data
      </Button>
      {asking && (
        <ConfirmDialog
          title="Reset the demo data?"
          text="Every scan, listing, claim, user and rate change made in this browser goes back to the original sample data."
          confirmLabel="Reset data"
          danger
          onConfirm={handleConfirm}
          onClose={() => setAsking(false)}
        />
      )}
    </>
  );
}
