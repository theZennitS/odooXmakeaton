"use client";

import React, { useState, useEffect } from "react";
import { useBrightloop } from "@/context/brightloop-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fmtCurr } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

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
      const activeId =
        selectedPaymentInvoiceId ||
        (unpaidInvoices.length > 0 ? unpaidInvoices[0].id : "");
      setInvoiceId(activeId);
      const inv = state.invoices.find((i) => i.id === activeId);
      if (inv) {
        setAmount(inv.outstanding_amount);
      }
      setNote("");
    }
  }, [
    paymentModalOpen,
    selectedPaymentInvoiceId,
    unpaidInvoices,
    state.invoices,
  ]);

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
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Record Payment Entry</DialogTitle>
            <DialogDescription>
              Reconcile incoming customer payments against outstanding subscription invoices.
            </DialogDescription>
          </DialogHeader>

          {unpaidInvoices.length === 0 ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>All Caught Up</AlertTitle>
              <AlertDescription>
                All invoices are currently paid in full. There are no outstanding receivables.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Against Invoice</Label>
                <Select value={invoiceId} onValueChange={handleInvoiceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {unpaidInvoices.map((inv) => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.id} — {inv.customer_name} (Due:{" "}
                        {fmtCurr(inv.outstanding_amount)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedInv && (
                  <p className="text-xs text-muted-foreground">
                    Total Invoice Amount: {fmtCurr(selectedInv.grand_total)} |
                    Already Paid: {fmtCurr(selectedInv.paid_amount)}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="payment-amount">Payment Amount ($)</Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={
                      selectedInv ? selectedInv.outstanding_amount : undefined
                    }
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Payment Mode</Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Bank Transfer">
                        Bank Wire Transfer
                      </SelectItem>
                      <SelectItem value="Instant Gateway / UPI">
                        Instant Gateway / UPI
                      </SelectItem>
                      <SelectItem value="Cash / Cheque">
                        Cash / Cheque
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="payment-note">
                  Reference / Transaction Note
                </Label>
                <Input
                  id="payment-note"
                  type="text"
                  placeholder="e.g. Stripe TXN-948210 / Wire REF-771"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPaymentModalOpen(false)}
            >
              Cancel
            </Button>
            {unpaidInvoices.length > 0 && (
              <Button type="submit">Reconcile &amp; Save Payment</Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
