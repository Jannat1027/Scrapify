import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../context/DataContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { createReport } from "../services/marketplace.js";
import ConfirmDialog from "./ConfirmDialog.jsx";

// Asks what went wrong with a listing and saves it as a report.
// Used on the My listings page.
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
