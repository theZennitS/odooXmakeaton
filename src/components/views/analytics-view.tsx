"use client";

import React, { useState } from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fmtCurr } from "@/lib/utils";
import {
  TrendingUp,
  CreditCard,
  Users,
  AlertTriangle,
  Zap,
  RotateCcw,
  ArrowRight,
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
      (new Date(i.due_date) < new Date("2026-10-31") &&
        i.outstanding_amount > 0)
  );
  const overdueAmount = overdueInvoices.reduce(
    (sum, i) => sum + i.outstanding_amount,
    0
  );

  const handleSimulate = () => {
    const res = triggerBillingDay();
    setLatency(res.latency);
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

        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Demo DB</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Demo Database?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will restore all subscriptions, invoices, payments, and discount rules back to the clean initial demo fixtures.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => resetDatabase()}>
                  Restore Fixtures
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button onClick={handleSimulate} size="sm" className="h-8 text-xs">
            <Zap className="h-3.5 w-3.5" />
            <span>Execute Billing Day</span>
          </Button>
        </div>
      </div>

      {/* 4 Official shadcn KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Monthly Recurring Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{fmtCurr(mrr)}</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              +14.2% MoM subscription growth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Active Subscriptions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {activeSubs.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              0.8% estimated churn rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Cash Collections
            </CardTitle>
            <CreditCard className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 font-mono">
              {fmtCurr(totalCollected)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Reconciled across {state.payments.length} entries
            </p>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Overdue Receivables
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive font-mono">
              {fmtCurr(overdueAmount)}
            </div>
            <p className="text-[11px] text-destructive font-medium mt-1">
              {overdueInvoices.length} overdue invoice(s) pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Automated Billing Simulation Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-[10px]">
              Cron Engine &bull; hooks.py
            </Badge>
            <Badge variant="outline" className="text-[10px] gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              SLA: {latency} ms (&lt; 2000 ms SLA)
            </Badge>
          </div>
          <CardTitle className="text-base">
            Automated Recurring Billing Engine (Strict Idempotency Guard)
          </CardTitle>
          <CardDescription className="text-xs leading-relaxed max-w-3xl">
            Clicking <strong>Execute Billing Day</strong> runs the automated recurring cron: it queries active subscriptions due for billing, validates idempotency keys, generates confirmed tax invoices, and advances renewal intervals with zero double-billing.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Split Cards: Recent Invoices Table + Plan Breakdown Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-sm">Recent Invoices</CardTitle>
              <CardDescription className="text-xs">
                Click any row to inspect or print tax invoice.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTo("billing")}
              className="h-8 text-xs"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Grand Total</TableHead>
                  <TableHead className="text-right pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.invoices.slice(0, 5).map((inv) => (
                  <TableRow
                    key={inv.id}
                    onClick={() => setPreviewInvoice(inv)}
                    className="cursor-pointer"
                  >
                    <TableCell className="pl-6 font-mono font-medium text-xs text-primary">
                      {inv.id}
                    </TableCell>
                    <TableCell className="font-medium text-xs">
                      {inv.customer_name}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-xs">
                      {fmtCurr(inv.grand_total)}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Badge
                        variant={
                          inv.status === "Paid"
                            ? "default"
                            : inv.status === "Overdue"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Plan Breakdown & MRR Share using official shadcn Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-sm">
                Plan Breakdown &amp; Active Subscriptions
              </CardTitle>
              <CardDescription className="text-xs">
                Distribution across active recurring contracts.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTo("products")}
              className="h-8 text-xs"
            >
              <span>Plans Catalog</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {state.plans.map((p) => {
              const count = activeSubs.filter((s) => s.plan_id === p.id).length;
              const percentage =
                activeSubs.length > 0
                  ? Math.round((count / activeSubs.length) * 100)
                  : 0;
              return (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground">
                      {p.name}{" "}
                      <span className="text-muted-foreground font-normal">
                        ({p.frequency})
                      </span>
                    </span>
                    <span className="font-semibold font-mono text-foreground">
                      {count} active ({percentage}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
