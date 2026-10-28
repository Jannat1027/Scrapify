import { useEffect, useState } from "react";
import Button from "../../components/Button.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import DataTable from "../../components/DataTable.jsx";
import FormField from "../../components/FormField.jsx";
import PaymentBadge from "../../components/PaymentBadge.jsx";
import PillTabs from "../../components/PillTabs.jsx";
import StatCard from "../../components/StatCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { apiErrorMessage } from "../../services/api.js";
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "../../services/marketplace.js";
import { confirmPayment, getPayments, rejectPayment } from "../../services/payment.js";
import { formatDate, formatTaka } from "../../utils/format.js";

const STATUS_TABS = ["all", "pending", "paid", "rejected"];
const MOBILE_NUMBER = /^01[3-9]\d{8}$/;

// Operator: money recyclers paid for claimed batches. Online (SSLCommerz) payments arrive already checked;
// bKash/Nagad transfers wait here until the operator confirms the money reached their wallet.
export default function PaymentsPage() {
  const showToast = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("all");
  const [rejecting, setRejecting] = useState(null);

  async function load() {
    try {
      setPayments(await getPayments());
    } catch (error) {
      showToast(apiErrorMessage(error), "red");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function send(request, message, tone) {
    try {
      await request();
      showToast(message, tone);
      load();
    } catch (error) {
      showToast(apiErrorMessage(error), "red");
    }
  }

  const confirm = (payment) => send(() => confirmPayment(payment.id), `${formatTaka(payment.amount)} confirmed as received.`);
  const reject = (payment, reason) =>
    send(() => rejectPayment(payment.id, reason), "Marked as not received. The recycler can pay again.", "amber");

  if (loading) return <div className="glass p-6">Loading...</div>;

  const shown = payments.filter((payment) => currentTab === "all" || payment.status === currentTab);
  const paid = payments.filter((payment) => payment.status === "paid");
  const waiting = payments.filter((payment) => payment.status === "pending");
  const total = (list) => list.reduce((sum, payment) => sum + payment.amount, 0);

  const columns = [
    { label: "Payment", render: (payment) => <b>{payment.id}</b> },
    { label: "Batch", render: (payment) => payment.listingId },
    { label: "Amount", render: (payment) => <b>{formatTaka(payment.amount)}</b> },
    { label: "Method", render: (payment) => <MethodCell payment={payment} /> },
    { label: "Reference", render: (payment) => <span className="font-mono text-xs">{payment.transactionId || payment.gateway?.bankTranId || "—"}</span> },
    { label: "Status", render: (payment) => <StatusCell payment={payment} /> },
    { label: "Date", render: (payment) => formatDate(payment.paidAt || payment.createdAt) },
    {
      label: "Action",
      render: (payment) =>
        payment.status === "pending" ? (
          <div className="flex gap-2">
            <Button size="sm" variant="primary" icon="check" onClick={() => confirm(payment)}>
              Received
            </Button>
            <Button size="sm" variant="danger" onClick={() => setRejecting(payment)}>
              Not received
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <>
      <div className="px-1">
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-ink/60">Money recyclers paid you for claimed batches. Check your bKash/Nagad app before confirming a transfer.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon="wallet" label="Received" value={formatTaka(total(paid))} hint={`${paid.length} payments`} />
        <StatCard icon="clock" label="Waiting for you" value={waiting.length} hint={formatTaka(total(waiting))} />
        <StatCard icon="receipt-text" label="All payments" value={payments.length} />
      </div>

      <WalletSettings />

      <PillTabs
        tabs={STATUS_TABS.map((status) => ({
          value: status,
          label: status === "all" ? "All" : PAYMENT_STATUS_LABELS[status],
          count: payments.filter((payment) => status === "all" || payment.status === status).length,
        }))}
        current={currentTab}
        onChange={setCurrentTab}
        label="Filter payments"
      />

      <section className="glass p-5">
        <DataTable columns={columns} rows={shown} emptyText="No payments here yet." />
      </section>

      {rejecting && (
        <ConfirmDialog
          title="The money didn't arrive?"
          text={`Check your ${PAYMENT_METHOD_LABELS[rejecting.method]} app for ${formatTaka(rejecting.amount)} from ${rejecting.senderNumber} (TrxID ${rejecting.transactionId}) first. The recycler will be asked to pay again.`}
          reasonPlaceholder="What's wrong?"
          confirmLabel="Mark not received"
          danger
          onConfirm={(reason) => reject(rejecting, reason)}
          onClose={() => setRejecting(null)}
        />
      )}
    </>
  );
}

// The bKash/Nagad numbers recyclers send money to when they pay by hand.
function WalletSettings() {
  const { user, saveWallets } = useAuth();
  const showToast = useToast();
  const [wallets, setWallets] = useState({ bkashNumber: user.bkashNumber || "", nagadNumber: user.nagadNumber || "" });
  const [saving, setSaving] = useState(false);
  const problemFor = (value) => (value === "" || MOBILE_NUMBER.test(value) ? "" : "Use a Bangladesh mobile number, like 01712345678.");
  const hasProblem = Boolean(problemFor(wallets.bkashNumber) || problemFor(wallets.nagadNumber));
  const noWallet = !user.bkashNumber && !user.nagadNumber;

  async function handleSubmit(event) {
    event.preventDefault();
    if (hasProblem) return;
    setSaving(true);
    try {
      await saveWallets(wallets);
      showToast("Payout wallets saved.");
    } catch (error) {
      showToast(apiErrorMessage(error), "red");
    }
    setSaving(false);
  }

  return (
    <section className={`glass p-5 ${noWallet ? "border-amber-400/40 bg-amber-400/5" : ""}`}>
      <h2 className="text-lg font-semibold">Your payout wallets</h2>
      <p className="text-sm text-ink/60">
        {noWallet
          ? "Add at least one number so recyclers can pay you by bKash or Nagad. Online payments work without it."
          : "Recyclers paying by hand send the money straight to these numbers."}
      </p>
      <form className="mt-4 grid items-start gap-4 sm:grid-cols-[1fr_1fr_auto]" onSubmit={handleSubmit} noValidate>
        {[
          ["bkashNumber", "bKash number"],
          ["nagadNumber", "Nagad number"],
        ].map(([field, label]) => (
          <FormField key={field} id={field} label={label} problem={problemFor(wallets[field]) || undefined}>
            <input
              id={field}
              className="input"
              type="tel"
              inputMode="numeric"
              maxLength={11}
              placeholder="01XXXXXXXXX"
              value={wallets[field]}
              onChange={(event) => setWallets({ ...wallets, [field]: event.target.value.trim() })}
            />
          </FormField>
        ))}
        <Button type="submit" variant="primary" icon="save" className="sm:mt-[26px]" disabled={saving || hasProblem}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </form>
    </section>
  );
}

function MethodCell({ payment }) {
  return (
    <div>
      <p>{PAYMENT_METHOD_LABELS[payment.method]}</p>
      {payment.method === "online" && payment.gateway?.cardType && <p className="text-xs text-ink/60">{payment.gateway.cardType}</p>}
      {payment.method !== "online" && <p className="text-xs text-ink/60">{`${payment.senderNumber} → ${payment.recipientNumber}`}</p>}
    </div>
  );
}

function StatusCell({ payment }) {
  return (
    <div className="grid gap-1">
      <PaymentBadge status={payment.status} />
      {payment.note && payment.status !== "paid" && <p className="max-w-[16rem] whitespace-normal text-xs text-ink/60">{payment.note}</p>}
    </div>
  );
}
