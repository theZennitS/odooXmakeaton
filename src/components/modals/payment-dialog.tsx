"use client";

import React, { useState, useEffect } from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { fmtCurr } from "@/lib/utils";
import { X, CreditCard } from "lucide-react";

export const PaymentDialog: React.FC = () => {
  const {
    paymentModalOpen,
    setPaymentModalOpen,
    selectedPaymentInvoiceId,
    setSelectedPaymentInvoiceId,
    state,
    triggerRecordPayment,
  } = useBrightloop();

  const unpaidInvoices = state.invoices.filter((i) => i.outstanding_amount > 0);

  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState("Credit Card");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (paymentModalOpen) {
      const activeId = selectedPaymentInvoiceId || (unpaidInvoices.length > 0 ? unpaidInvoices[0].id : "");
      setInvoiceId(activeId);
      const inv = state.invoices.find((i) => i.id === activeId);
      if (inv) {
        setAmount(inv.outstanding_amount);
      }
      setNote("");
    }
  }, [paymentModalOpen, selectedPaymentInvoiceId, unpaidInvoices, state.invoices]);

  const handleInvoiceChange = (newId: string) => {
    setInvoiceId(newId);
    setSelectedPaymentInvoiceId(newId);
    const inv = state.invoices.find((i) => i.id === newId);
    if (inv) {
      setAmount(inv.outstanding_amount);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceId) return;
    const res = triggerRecordPayment(invoiceId, Number(amount), method, note);
    if (res.success) {
      setPaymentModalOpen(false);
    }
  };

  const selectedInv = state.invoices.find((i) => i.id === invoiceId);

  return (
    <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <DialogTitle>Record Payment Entry</DialogTitle>
          </div>
          <button
            type="button"
            onClick={() => setPaymentModalOpen(false)}
            className="text-muted-foreground hover:text-foreground rounded-full p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        <DialogBody>
          {unpaidInvoices.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              All invoices are currently paid in full! No outstanding receivables.
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Against Invoice <span className="text-destructive">*</span>
                </label>
                <Select
                  value={invoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  required
                >
                  {unpaidInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.id} — {inv.customer_name} (Due: {fmtCurr(inv.outstanding_amount)})
                    </option>
                  ))}
                </Select>
                {selectedInv && (
                  <p className="text-xs text-muted-foreground">
                    Total Invoice Amount: {fmtCurr(selectedInv.grand_total)} | Already Paid: {fmtCurr(selectedInv.paid_amount)}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Payment Amount ($) <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={selectedInv ? selectedInv.outstanding_amount : undefined}
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Payment Mode <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    required
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Wire Transfer</option>
                    <option value="Instant Gateway / UPI">Instant Gateway / UPI</option>
                    <option value="Cash / Cheque">Cash / Cheque</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Reference / Transaction Note
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Stripe TXN-948210 / Wire REF-771"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </>
          )}
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setPaymentModalOpen(false)}
          >
            Cancel
          </Button>
          {unpaidInvoices.length > 0 && (
            <Button type="submit" variant="blue">
              Reconcile & Save Payment
            </Button>
          )}
        </DialogFooter>
      </form>
    </Dialog>
  );
};

