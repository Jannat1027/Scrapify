import { useEffect, useState } from "react";
import { useData } from "../context/DataContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { apiErrorMessage } from "../services/api.js";
import { getCheckoutOptions, reportManualPayment, startOnlinePayment } from "../services/payment.js";
import { formatTaka } from "../utils/format.js";
import Button from "./Button.jsx";
import FormField from "./FormField.jsx";
import Icon from "./Icon.jsx";
import Modal from "./Modal.jsx";
import PaymentBadge from "./PaymentBadge.jsx";

const MOBILE_NUMBER = /^01[3-9]\d{8}$/;
const TRANSACTION_ID = /^[A-Za-z0-9]{8,20}$/;
const WALLET_NAMES = { bkash: "bKash", nagad: "Nagad" };

export default function PayDialog({ listingId, onClose }) {
  const { send } = useData();
  const showToast = useToast();
  const [options, setOptions] = useState(null);
  const [loadProblem, setLoadProblem] = useState("");
  const [method, setMethod] = useState("");
  const [phone, setPhone] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getCheckoutOptions(listingId)
      .then((answer) => {
        setOptions(answer);
        setMethod(answer.online ? "online" : ["bkash", "nagad"].find((wallet) => answer.wallets[wallet]) || "");
      })
      .catch((error) => setLoadProblem(apiErrorMessage(error)));
  }, [listingId]);

  if (loadProblem) {
    return (
      <Modal onClose={onClose}>
        <p className="text-red-600">{loadProblem}</p>
        <div className="mt-5 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </Modal>
    );
  }
  if (!options) {
    return (
      <Modal onClose={onClose}>
        <p className="text-ink/60">Loading payment options…</p>
      </Modal>
    );
  }

  if (options.payment && options.payment.status !== "initiated") {
    return (
      <Modal onClose={onClose}>
        <h2 className="text-[1.25rem] font-bold">{`Payment for ${options.listingId}`}</h2>
        <div className="mt-4 flex items-center gap-3">
          <PaymentBadge status={options.payment.status} />
          <span className="font-semibold">{formatTaka(options.payment.amount)}</span>
        </div>
        <p className="mt-3 text-sm text-ink/60">
          {options.payment.status === "paid"
            ? "This batch is paid for."
            : "Your transfer is waiting for the operator to confirm it arrived. You'll see it change to Paid here."}
        </p>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </Modal>
    );
  }

  const wallet = options.wallets[method];
  const phoneProblem = MOBILE_NUMBER.test(phone.trim()) ? "" : "Enter a Bangladesh mobile number, like 01712345678.";
  const transactionProblem = TRANSACTION_ID.test(transactionId.trim()) ? "" : "Enter the TrxID from your payment SMS (8 to 20 letters and numbers).";
  const formOk = !phoneProblem && (method === "online" || !transactionProblem);
  const noWayToPay = !options.online && !options.wallets.bkash && !options.wallets.nagad;

  async function handleSubmit(event) {
    event.preventDefault();
    setTriedSubmit(true);
    if (!formOk || busy) return;
    setBusy(true);

    if (method === "online") {
      try {
        window.location.assign(await startOnlinePayment(options.listingId, phone.trim()));
      } catch (error) {
        showToast(apiErrorMessage(error), "red");
        setBusy(false);
      }
      return;
    }

    const payment = await send(() =>
      reportManualPayment({ listingId: options.listingId, method, senderNumber: phone.trim(), transactionId: transactionId.trim() }),
    );
    setBusy(false);
    if (!payment) return;
    showToast("Payment sent for confirmation. The operator will confirm it arrived.");
    onClose();
  }

  return (
    <Modal onClose={onClose}>
      <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
        <div>
          <h2 className="text-[1.25rem] font-bold">{`Pay ${formatTaka(options.amount)}`}</h2>
          <p className="mt-1 text-sm text-ink/60">{`To ${options.operator.org} for batch ${options.listingId}.`}</p>
        </div>

        {noWayToPay ? (
          <p className="rounded-xl border border-amber-400/40 bg-amber-50/80 p-4 text-sm text-amber-800">
            This operator hasn't added a bKash or Nagad number yet, and online payment isn't set up. Report a problem on the claim so an admin can help.
          </p>
        ) : (
          <>
            <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Payment method">
              {options.online && <MethodTile active={method === "online"} icon="wallet" title="Pay online" hint="bKash, Nagad, card" onClick={() => setMethod("online")} />}
              {["bkash", "nagad"].map((name) => (
                <MethodTile
                  key={name}
                  active={method === name}
                  icon="smartphone"
                  title={WALLET_NAMES[name]}
                  hint={options.wallets[name] ? "Send Money" : "Not added"}
                  disabled={!options.wallets[name]}
                  onClick={() => setMethod(name)}
                />
              ))}
            </div>

            {method === "online" ? (
              <>
                <p className="flex gap-2 text-sm text-ink/60">
                  <Icon name="lock" className="mt-0.5 text-forest" />
                  You'll go to the secure SSLCommerz page to pay, then come back here. The payment is checked with SSLCommerz before it's marked paid.
                </p>
                {options.testMode && (
                  <p className="flex gap-2 rounded-xl border border-amber-400/40 bg-amber-50/80 p-3 text-sm text-amber-800" role="note">
                    <Icon name="triangle-alert" className="mt-0.5" />
                    <span>
                      <b>Test mode.</b> Online payment uses the SSLCommerz sandbox: no real money is charged and the operator receives nothing. To pay
                      for real, use bKash or Nagad above.
                    </span>
                  </p>
                )}
              </>
            ) : (
              <div className="glass grid gap-1 p-4 text-sm">
                <p>
                  <span>{`1. Open ${WALLET_NAMES[method]} and use Send Money to `}</span>
                  <b className="font-mono text-base">{wallet}</b>
                </p>
                <p>{`2. Send exactly ${formatTaka(options.amount)}.`}</p>
                <p>3. Enter your number and the TrxID from the SMS below.</p>
              </div>
            )}

            <FormField id="payer-phone" label={method === "online" ? "Your mobile number" : `Your ${WALLET_NAMES[method]} number`} problem={triedSubmit ? phoneProblem : undefined}>
              <input
                id="payer-phone"
                className="input"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={11}
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </FormField>

            {method !== "online" && (
              <FormField id="trx-id" label="Transaction ID (TrxID)" problem={triedSubmit ? transactionProblem : undefined}>
                <input
                  id="trx-id"
                  className="input font-mono uppercase"
                  autoComplete="off"
                  maxLength={20}
                  placeholder="e.g. BKA7X2M9QP"
                  value={transactionId}
                  onChange={(event) => setTransactionId(event.target.value)}
                />
              </FormField>
            )}
          </>
        )}

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          {!noWayToPay && (
            <Button type="submit" variant="primary" icon={method === "online" ? "lock" : "check"} disabled={busy}>
              {busy ? "Please wait…" : method === "online" ? `Pay ${formatTaka(options.amount)} online` : "I've sent the money"}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}

function MethodTile({ active, icon, title, hint, disabled = false, onClick }) {
  const look = active ? "border-mint bg-mint/10 ring-2 ring-mint/40" : "border-ink/10 bg-white/70 hover:border-ink/20";
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      disabled={disabled}
      onClick={onClick}
      className={`grid gap-1 rounded-2xl border p-3 text-left transition-all duration-150 disabled:opacity-40 ${look}`}
    >
      <span className="flex items-center gap-2 font-semibold">
        <Icon name={icon} className="text-forest" />
        {title}
      </span>
      <span className="text-xs text-ink/60">{hint}</span>
    </button>
  );
}
