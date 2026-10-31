"use client";

import React from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { Dialog, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fmtCurr } from "@/lib/utils";
import { Printer, X, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export const InvoicePreviewModal: React.FC = () => {
  const { previewInvoice, setPreviewInvoice } = useBrightloop();

  if (!previewInvoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Paid</Badge>;
      case "Overdue":
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" /> Overdue</Badge>;
      default:
        return <Badge variant="info" className="gap-1"><Clock className="w-3 h-3" /> Confirmed</Badge>;
    }
  };

  return (
    <Dialog open={!!previewInvoice} onOpenChange={(open) => !open && setPreviewInvoice(null)}>
      <DialogHeader>
        <div className="flex items-center space-x-2">
          <Printer className="w-5 h-5 text-blue-600" />
          <DialogTitle>Tax Invoice Preview</DialogTitle>
        </div>
        <button
          type="button"
          onClick={() => setPreviewInvoice(null)}
          className="text-muted-foreground hover:text-foreground rounded-full p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </DialogHeader>

      <DialogBody>
        <div className="p-4 bg-background border rounded-lg shadow-xs space-y-6 print:border-none print:shadow-none">
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  B
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-tight">Brightloop Software Inc.</h3>
                  <p className="text-xs text-muted-foreground">742 Evergreen Terrace, Suite 400 • billing@brightloop.io</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">TAX INVOICE</span>
              <div className="font-mono font-bold text-base text-blue-600">{previewInvoice.id}</div>
              <div className="text-xs text-muted-foreground">Date: {previewInvoice.invoice_date}</div>
            </div>
          </div>

          {/* Customer & Payment Meta */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Billed To:</span>
              <p className="font-semibold text-sm text-foreground">{previewInvoice.customer_name}</p>
              <p className="text-muted-foreground">Linked Subscription: <span className="font-mono font-medium">{previewInvoice.subscription_id}</span></p>
              <p className="text-muted-foreground">Period: {previewInvoice.billing_period_start} to {previewInvoice.billing_period_end}</p>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Payment Status:</span>
              <div className="flex justify-end">{getStatusBadge(previewInvoice.status)}</div>
              <p className="text-muted-foreground mt-1">Payment Due Date: <span className="font-medium text-foreground">{previewInvoice.due_date}</span></p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-2.5 font-semibold text-muted-foreground">Item Description</th>
                  <th className="text-center p-2.5 font-semibold text-muted-foreground">Qty</th>
                  <th className="text-right p-2.5 font-semibold text-muted-foreground">Unit Price</th>
                  <th className="text-right p-2.5 font-semibold text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {previewInvoice.items.map((it, idx) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="p-2.5 font-medium">{it.product_name}</td>
                    <td className="p-2.5 text-center">{it.quantity}</td>
                    <td className="p-2.5 text-right">{fmtCurr(it.unit_price)}</td>
                    <td className="p-2.5 text-right font-semibold">{fmtCurr(it.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{fmtCurr(previewInvoice.subtotal)}</span>
              </div>
              {previewInvoice.discount_amount > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>Discount:</span>
                  <span>-{fmtCurr(previewInvoice.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Standard VAT (18%):</span>
                <span className="font-medium">{fmtCurr(previewInvoice.tax_total)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t pt-2 border-foreground/10">
                <span>Grand Total:</span>
                <span className="text-blue-600">{fmtCurr(previewInvoice.grand_total)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Paid to Date:</span>
                <span>{fmtCurr(previewInvoice.paid_amount)}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t text-sm">
                <span>Balance Due:</span>
                <span className={previewInvoice.outstanding_amount > 0 ? "text-destructive" : "text-emerald-600"}>
                  {fmtCurr(previewInvoice.outstanding_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogBody>

      <DialogFooter>
        <Button variant="outline" onClick={() => setPreviewInvoice(null)}>
          Close
        </Button>
        <Button variant="blue" onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" />
          Print / PDF
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
