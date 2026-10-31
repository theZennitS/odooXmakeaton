"use client";

import React, { useState } from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { fmtCurr } from "@/lib/utils";
import { Search, CreditCard, Printer, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export const BillingInvoicesView: React.FC = () => {
  const { state, openPaymentModal, setPreviewInvoice } = useBrightloop();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  let list = state.invoices;

  if (statusFilter !== "all") {
    list = list.filter((i) => i.status.toLowerCase() === statusFilter.toLowerCase());
  }

  if (search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (i) =>
        i.id.toLowerCase().includes(q) ||
        i.customer_name.toLowerCase().includes(q) ||
        i.subscription_id.toLowerCase().includes(q)
    );
  }

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
    <div className="space-y-4">
      {/* View Header with Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Subscription Invoices &amp; Accounting
          </h1>
          <p className="text-xs text-muted-foreground">
            View tax invoices, outstanding balances, and multi-method payment reconciliations.
          </p>
        </div>

        <Button
          onClick={() => openPaymentModal()}
          variant="blue"
          className="gap-1.5 shadow-sm text-xs"
        >
          <CreditCard className="w-4 h-4" />
          <span>Record Payment</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-muted/20 border rounded-xl">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by Invoice ID or Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-background"
            />
          </div>

          <div className="w-40">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 text-xs bg-background"
            >
              <option value="all">Status: All</option>
              <option value="Confirmed">Confirmed (Unpaid)</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </Select>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Showing {list.length} invoices
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-xl bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="p-3 text-left font-semibold text-muted-foreground">Invoice ID</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Status</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Subscription</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Customer</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Billing Period</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Due Date</th>
                <th className="p-3 text-right font-semibold text-muted-foreground">Grand Total</th>
                <th className="p-3 text-right font-semibold text-muted-foreground">Balance Due</th>
                <th className="p-3 text-right font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground text-sm">
                    No invoices matching criteria.
                  </td>
                </tr>
              ) : (
                list.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3 font-mono font-semibold text-blue-600">
                      <button
                        onClick={() => setPreviewInvoice(inv)}
                        className="hover:underline text-left"
                      >
                        {inv.id}
                      </button>
                    </td>
                    <td className="p-3">{getStatusBadge(inv.status)}</td>
                    <td className="p-3 font-mono text-muted-foreground">{inv.subscription_id}</td>
                    <td className="p-3 font-medium text-foreground">{inv.customer_name}</td>
                    <td className="p-3 text-muted-foreground">
                      {inv.billing_period_start} to {inv.billing_period_end}
                    </td>
                    <td className="p-3 text-muted-foreground font-mono">{inv.due_date}</td>
                    <td className="p-3 text-right font-semibold text-foreground font-mono">
                      {fmtCurr(inv.grand_total)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold">
                      <span className={inv.outstanding_amount > 0 ? "text-destructive" : "text-emerald-600"}>
                        {fmtCurr(inv.outstanding_amount)}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      {inv.outstanding_amount > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPaymentModal(inv.id)}
                          className="h-7 px-2 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        >
                          Pay
                        </Button>
                      )}
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => setPreviewInvoice(inv)}
                        className="h-7 px-2 text-xs gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
