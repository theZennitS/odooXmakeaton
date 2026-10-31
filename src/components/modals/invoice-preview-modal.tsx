"use client";

import React from "react";
import { useBrightloop } from "@/context/brightloop-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fmtCurr } from "@/lib/utils";
import { Printer, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export const InvoicePreviewModal: React.FC = () => {
  const { previewInvoice, setPreviewInvoice } = useBrightloop();

  if (!previewInvoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" /> Paid
          </Badge>
        );
      case "Overdue":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" /> Overdue
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" /> Confirmed
          </Badge>
        );
    }
  };

  return (
    <Dialog
      open={!!previewInvoice}
      onOpenChange={(open) => !open && setPreviewInvoice(null)}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tax Invoice Preview</DialogTitle>
          <DialogDescription>
            Official tax invoice statement for {previewInvoice.id}.
          </DialogDescription>
        </DialogHeader>

        <Card className="shadow-none print:border-none">
          <CardContent className="p-5 space-y-5">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <Badge className="h-8 w-8 rounded-md p-0 flex items-center justify-center text-sm font-bold">
                  B
                </Badge>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">
                    Brightloop Software Inc.
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    742 Evergreen Terrace, Suite 400 &bull; billing@brightloop.io
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  TAX INVOICE
                </span>
                <div className="font-mono font-bold text-sm text-primary">
                  {previewInvoice.id}
                </div>
                <div className="text-xs text-muted-foreground">
                  Date: {previewInvoice.invoice_date}
                </div>
              </div>
            </div>

            <Separator />

            {/* Customer & Payment Meta */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Billed To:
                </span>
                <p className="font-semibold text-sm text-foreground">
                  {previewInvoice.customer_name}
                </p>
                <p className="text-muted-foreground">
                  Linked Subscription:{" "}
                  <span className="font-mono font-medium">
                    {previewInvoice.subscription_id}
                  </span>
                </p>
                <p className="text-muted-foreground">
                  Period: {previewInvoice.billing_period_start} to{" "}
                  {previewInvoice.billing_period_end}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Payment Status:
                </span>
                <div className="flex justify-end">
                  {getStatusBadge(previewInvoice.status)}
                </div>
                <p className="text-muted-foreground mt-1">
                  Payment Due Date:{" "}
                  <span className="font-medium text-foreground">
                    {previewInvoice.due_date}
                  </span>
                </p>
              </div>
            </div>

            {/* Official shadcn Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Description</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewInvoice.items.map((it, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium text-xs">
                        {it.product_name}
                      </TableCell>
                      <TableCell className="text-center text-xs">
                        {it.quantity}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {fmtCurr(it.unit_price)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-xs">
                        {fmtCurr(it.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals Summary */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium font-mono">
                    {fmtCurr(previewInvoice.subtotal)}
                  </span>
                </div>
                {previewInvoice.discount_amount > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>Discount:</span>
                    <span className="font-mono">
                      -{fmtCurr(previewInvoice.discount_amount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Standard VAT (18%):</span>
                  <span className="font-medium font-mono">
                    {fmtCurr(previewInvoice.tax_total)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-bold">
                  <span>Grand Total:</span>
                  <span className="text-primary font-mono">
                    {fmtCurr(previewInvoice.grand_total)}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Paid to Date:</span>
                  <span className="font-mono">
                    {fmtCurr(previewInvoice.paid_amount)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-sm">
                  <span>Balance Due:</span>
                  <span
                    className={
                      previewInvoice.outstanding_amount > 0
                        ? "text-destructive font-mono"
                        : "text-emerald-600 font-mono"
                    }
                  >
                    {fmtCurr(previewInvoice.outstanding_amount)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <DialogFooter>
          <Button variant="outline" onClick={() => setPreviewInvoice(null)}>
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print / PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
