import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../context/DataContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { createReport } from "../services/marketplace.js";
import ConfirmDialog from "./ConfirmDialog.jsx";

// Asks what went wrong with a listing and sends it to the admin's Reports page.
// Used by operators (My listings) and recyclers (My claims).
export default function ReportProblemDialog({ listingId, onClose }) {
  const { user } = useAuth();
  const { insertRow } = useData();
  const showToast = useToast();

  function sendReport(reason) {
    insertRow("reports", createReport(listingId, user.id, reason));
    showToast("Report sent. An admin will look into it.");
  }

  return (
    <ConfirmDialog
      title="Report a problem"
      text={`Listing ${listingId}`}
      reasonPlaceholder="What went wrong?"
      confirmLabel="Send report"
      onConfirm={sendReport}
      onClose={onClose}
    />
  );
}
