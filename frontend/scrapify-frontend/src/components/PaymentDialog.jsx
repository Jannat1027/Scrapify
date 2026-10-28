import { useState } from "react";
import Button from "./Button.jsx";
import FormField from "./FormField.jsx";
import Modal from "./Modal.jsx";
import { createPayment } from "../services/payment.js";
import { useToast } from "../context/ToastContext.jsx";

const METHODS = [
  { id: "bkash", name: "bKash", color: "bg-pink-600" },
  { id: "nagad", name: "Nagad", color: "bg-orange-600" },
];

export default function PaymentDialog({ listing, onClose, onSuccess }) {
  const showToast = useToast();
  const [method, setMethod] = useState("bkash");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!phoneNumber) return showToast("Enter phone number", "red");
    setLoading(true);
    try {
      const p = await createPayment({ listingId: listing.id, method, phoneNumber });
      setPayment(p);
      showToast("Payment request created");
    } catch (err) {
      showToast(err.response?.data?.message || "Payment failed", "red");
    } finally {
      setLoading(false);
    }
  }

  if (payment) {
    return (
      <Modal onClose={onClose}>
        <div className="grid gap-4">
          <h2 className="text-[1.25rem] font-bold">Pay with {method === "bkash" ? "bKash" : "Nagad"}</h2>
          <div className="rounded-xl border border-ink/10 p-4 text-sm">
            <p><b>Amount:</b> ৳{payment.amount}</p>
            <p><b>Payment ID:</b> {payment.id}</p>
            <p><b>Wallet:</b> {method === "bkash" ? "bKash" : "Nagad"}</p>
            <p><b>Merchant number:</b> {payment.recipientNumber}</p>
            <p><b>Sender number:</b> {phoneNumber}</p>
            <p className="mt-2 text-ink/60">Complete the transfer in your wallet. Once the merchant confirms receipt, enter the transaction ID on the Payments page.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <h2 className="text-[1.25rem] font-bold">Make Payment</h2>
        <p className="text-sm text-ink/60">Amount: <b>৳{listing.price}</b>. The final amount is confirmed by the server.</p>
        <div className="grid grid-cols-2 gap-2">
          {METHODS.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={`rounded-xl p-3 text-white ${m.color} ${method === m.id ? "ring-2 ring-ink" : "opacity-80"}`}
            >
              {m.name}
            </button>
          ))}
        </div>
        <FormField id="phone" label="Sender wallet number">
          <input id="phone" className="input" type="tel" inputMode="numeric" autoComplete="tel" maxLength={11} value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="01XXXXXXXXX" />
        </FormField>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={loading}>{loading ? "Processing..." : "Proceed"}</Button>
        </div>
      </form>
    </Modal>
  );
}
