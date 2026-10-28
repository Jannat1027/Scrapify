import { useEffect, useState } from "react";
import Button from "../../components/Button.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Icon from "../../components/Icon.jsx";
import { getPayments, verifyPayment, completePayment } from "../../services/payment.js";
import { useToast } from "../../context/ToastContext.jsx";
import { formatDate, formatTaka } from "../../utils/format.js";

export default function PaymentsPage() {
  const showToast = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tx, setTx] = useState({});

  async function load() {
    try {
      const data = await getPayments();
      setPayments(data);
    } catch (e) {
      showToast("Failed to load payments", "red");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onVerify(id) {
    if (!tx[id]) return showToast("Enter transaction ID", "red");
    try {
      await verifyPayment(id, tx[id]);
      showToast("Payment verified");
      load();
    } catch (e) {
      showToast(e.response?.data?.message || "Failed", "red");
    }
  }

  async function onComplete(id) {
    try {
      await completePayment(id);
      showToast("Payment completed");
      load();
    } catch (e) {
      showToast(e.response?.data?.message || "Failed", "red");
    }
  }

  if (loading) return <div className="glass p-6">Loading...</div>;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-ink/60">Manual bKash/Nagad transfers for claimed listings. Confirm the money reached your merchant account before recording the transaction ID.</p>
        </div>
      </div>

      <div className="glass overflow-hidden">
        {payments.length === 0 ? (
          <EmptyState icon="receipt" text="No payments yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left">
                  <th className="p-4">Payment ID</th>
                  <th className="p-4">Listing</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="border-b border-ink/5">
                    <td className="p-4 font-medium">{p.id}</td>
                    <td className="p-4">{p.listingId}</td>
                    <td className="p-4 uppercase">{p.method}</td>
                    <td className="p-4">{p.transactionId || "—"}</td>
                    <td className="p-4">{formatTaka(p.amount)}</td>
                    <td className="p-4">{p.phoneNumber}</td>
                    <td className="p-4 capitalize">{p.status}</td>
                    <td className="p-4">{formatDate(p.createdAt)}</td>
                    <td className="p-4">
                      {p.status === "pending" && (
                        <div className="flex gap-2">
                          <input className="input w-40" placeholder="TXN ID" value={tx[p.id]||""} onChange={e=>setTx({...tx,[p.id]:e.target.value})} />
                          <Button size="sm" onClick={()=>onVerify(p.id)}>Confirm received</Button>
                        </div>
                      )}
                      {p.status === "paid" && <Button size="sm" variant="primary" onClick={()=>onComplete(p.id)}>Mark Completed</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
