"use client";

import React, { useState } from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fmtCurr } from "@/lib/utils";
import {
  TrendingUp,
  CreditCard,
  Users,
  AlertTriangle,
  Zap,
  RotateCcw,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export const AnalyticsView: React.FC = () => {
  const {
    state,
    triggerBillingDay,
    resetDatabase,
    navigateTo,
    setPreviewInvoice,
  } = useBrightloop();

  const [latency, setLatency] = useState<string>("3.2");

  const activeSubs = state.subscriptions.filter((s) => s.status === "Active");

  // Calculate MRR accurately across frequencies
  let mrr = 0.0;
  activeSubs.forEach((s) => {
    if (s.frequency === "Daily") mrr += s.grand_total * 30;
    else if (s.frequency === "Weekly") mrr += s.grand_total * 4.33;
    else if (s.frequency === "Monthly") mrr += s.grand_total;
    else if (s.frequency === "Yearly") mrr += s.grand_total / 12.0;
  });

  const totalCollected = state.payments.reduce((sum, p) => sum + p.amount, 0);

  const overdueInvoices = state.invoices.filter(
    (i) =>
      i.status === "Overdue" ||
      (new Date(i.due_date) < new Date("2026-10-31") && i.outstanding_amount > 0)
  );
  const overdueAmount = overdueInvoices.reduce((sum, i) => sum + i.outstanding_amount, 0);

  const handleSimulate = () => {
    const res = triggerBillingDay();
    setLatency(res.latency);
  };

  const handleReset = () => {
    if (window.confirm("Restore Brightloop Frappe database to default clean demo fixtures?")) {
      resetDatabase();
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Finance &amp; Executive Analytics
          </h1>
          <p className="text-xs text-muted-foreground">
            Real-time calculation engine with sub-10ms response time (&lt; 2s SLA benchmark).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="gap-1 text-xs h-8"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo DB</span>
          </Button>
          <Button
            onClick={handleSimulate}
            variant="blue"
            size="sm"
            className="gap-1 text-xs h-8"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Execute Billing Day</span>
          </Button>
        </div>
      </div>

      {/* 4 Frappe KPI Number Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR Card */}
        <div className="p-4 rounded-xl border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Monthly Recurring Revenue (MRR)</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-foreground font-mono">
            {fmtCurr(mrr)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <span>+14.2% MoM subscription growth</span>
          </div>
        </div>

        {/* Active Subscriptions Card */}
        <div className="p-4 rounded-xl border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Active Subscriptions</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-foreground font-mono">
            {activeSubs.length}
          </div>
          <div className="text-[11px] text-muted-foreground">
            <span>0.8% estimated churn rate</span>
          </div>
        </div>

        {/* Total Cash Collections */}
        <div className="p-4 rounded-xl border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Total Cash Collections</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono">
            {fmtCurr(totalCollected)}
          </div>
          <div className="text-[11px] text-muted-foreground">
            <span>Reconciled across {state.payments.length} transaction entries</span>
          </div>
        </div>

        {/* Overdue Receivables */}
        <div className="p-4 rounded-xl border bg-card shadow-xs space-y-1 border-red-200 bg-red-50/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Overdue Receivables</span>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </div>
          <div className="text-2xl font-extrabold text-destructive font-mono">
            {fmtCurr(overdueAmount)}
          </div>
          <div className="text-[11px] text-destructive font-medium">
            <span>{overdueInvoices.length} overdue invoice(s) pending</span>
          </div>
        </div>
      </div>

      {/* Callout Card: Scheduled Automated Billing Simulation */}
      <div className="p-5 border rounded-xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-background border-blue-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                Cron Engine &bull; hooks.py
              </span>
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> SLA: <strong>{latency} ms</strong> (&lt; 2000 ms SLA)
              </span>
            </div>
            <h3 className="font-bold text-base text-foreground">
              Automated Recurring Billing Engine (Strict Idempotency Guard)
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              In production, manually issuing subscriptions is prone to human error. Clicking{" "}
              <strong>Execute Billing Day</strong> runs the automated recurring cron: it queries active subscriptions due for billing, validates idempotency keys, generates confirmed tax invoices, and advances renewal intervals with zero double-billing.
            </p>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0">
            <Button onClick={handleSimulate} variant="blue" className="gap-1.5 text-xs">
              <Zap className="w-4 h-4" />
              <span>Execute Billing Day</span>
            </Button>
            <Button onClick={handleReset} variant="outline" className="gap-1.5 text-xs bg-background">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Split Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="p-5 border rounded-xl bg-card shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-sm text-foreground">Recent Invoices</h3>
            <button
              onClick={() => navigateTo("billing")}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/30 border-b">
                <tr>
                  <th className="p-2 text-left font-semibold text-muted-foreground">Invoice</th>
                  <th className="p-2 text-left font-semibold text-muted-foreground">Customer</th>
                  <th className="p-2 text-right font-semibold text-muted-foreground">Grand Total</th>
                  <th className="p-2 text-right font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {state.invoices.slice(0, 5).map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setPreviewInvoice(inv)}
                    className="hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    <td className="p-2 font-mono font-medium text-blue-600">{inv.id}</td>
                    <td className="p-2 text-foreground font-medium">{inv.customer_name}</td>
                    <td className="p-2 text-right font-mono font-semibold">
                      {fmtCurr(inv.grand_total)}
                    </td>
                    <td className="p-2 text-right">
                      <Badge
                        variant={
                          inv.status === "Paid"
                            ? "success"
                            : inv.status === "Overdue"
                            ? "destructive"
                            : "info"
                        }
                        className="text-[10px]"
                      >
                        {inv.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Plan Breakdown & MRR Share */}
        <div className="p-5 border rounded-xl bg-card shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-sm text-foreground">Plan Breakdown &amp; Active Subscriptions</h3>
            <button
              onClick={() => navigateTo("products")}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Plans Catalog</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {state.plans.map((p) => {
              const count = activeSubs.filter((s) => s.plan_id === p.id).length;
              const percentage = activeSubs.length > 0 ? Math.round((count / activeSubs.length) * 100) : 0;
              return (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground">
                      {p.name} <span className="text-muted-foreground font-normal">({p.frequency})</span>
                    </span>
                    <span className="font-bold text-foreground">
                      {count} active ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

