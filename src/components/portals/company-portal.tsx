"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Subscription, Invoice, Payment } from "@/types";
import { CompanyProfile } from "@/types/company";
import { AuditLedgerRecord } from "@/types/overall";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { fmtCurr } from "@/lib/utils";
import {
  Building2,
  TrendingUp,
  CreditCard,
  Users,
  AlertTriangle,
  Zap,
  RefreshCw,
  Clock,
  CheckCircle2,
  Activity,
  Layers,
  Receipt,
  Landmark,
  User,
  Plus,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { CompanyWorkspaceView } from "@/components/views/company-workspace-view";
import { InvoicePreviewModal } from "@/components/modals/invoice-preview-modal";

interface CompanyPortalProps {
  onSwitchToUser?: () => void;
}

export const CompanyPortal: React.FC<CompanyPortalProps> = ({ onSwitchToUser }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "subscriptions" | "invoices" | "audit" | "organization">("overview");

  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [financials, setFinancials] = useState<{
    mrr: number;
    activeSubscriptionsCount: number;
    totalCustomersCount: number;
    totalCollections: number;
    overdueReceivables: number;
    overdueCount: number;
    totalInvoicesIssued: number;
  }>({
    mrr: 0,
    activeSubscriptionsCount: 0,
    totalCustomersCount: 0,
    totalCollections: 0,
    overdueReceivables: 0,
    overdueCount: 0,
    totalInvoicesIssued: 0,
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLedgerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [cronRunning, setCronRunning] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "info" | "warning" } | null>(null);
  const [previewInv, setPreviewInv] = useState<Invoice | null>(null);

  const showToast = (text: string, type: "success" | "info" | "warning" = "info") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      const [compRes, subRes, invRes, auditRes] = await Promise.all([
        fetch("/api/company"),
        fetch("/api/subscriptions"),
        fetch("/api/invoices"),
        fetch("/api/audit"),
      ]);

      const compData = await compRes.json();
      const subData = await subRes.json();
      const invData = await invRes.json();
      const auditData = await auditRes.json();

      if (compData.company) setCompany(compData.company);
      if (compData.financialSummary) setFinancials(compData.financialSummary);
      if (subData.subscriptions) setSubscriptions(subData.subscriptions);
      if (invData.invoices) setInvoices(invData.invoices);
      if (auditData.auditLedger) setAuditLogs(auditData.auditLedger);
    } catch (e) {
      console.error("Failed to fetch company portal data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
    // Auto polling every 4 seconds so user actions in other tab/window reflect live!
    const timer = setInterval(() => {
      fetchCompanyData();
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleRunBillingDay = async () => {
    setCronRunning(true);
    try {
      const res = await fetch("/api/cron/billing-day", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        await fetchCompanyData();
      } else {
        showToast(data.error || "Cron failed", "warning");
      }
    } catch (e: any) {
      showToast(e.message, "warning");
    } finally {
      setCronRunning(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="success">Active</Badge>;
      case "Quotation":
        return <Badge variant="warning">Quotation</Badge>;
      case "Confirmed":
        return <Badge variant="info">Confirmed</Badge>;
      case "Paid":
        return <Badge variant="success">Paid</Badge>;
      case "Overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "Paused":
        return <Badge variant="secondary">Paused</Badge>;
      case "Closed":
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-16 right-4 z-50 p-3 bg-blue-600 text-white rounded-lg shadow-xl text-xs font-semibold animate-in slide-in-from-top-2">
          {toastMsg.text}
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 border rounded-xl bg-card border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            B
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {company?.name || "Brightloop Software Inc."}
              </h1>
              <Badge variant="info" className="text-[10px]">
                Company Desk
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {company?.taxId} &bull; {company?.headquartersAddress?.city}, {company?.headquartersAddress?.country}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCompanyData}
            className="h-8 text-xs gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync API</span>
          </Button>

          <Button
            variant="blue"
            size="sm"
            onClick={handleRunBillingDay}
            disabled={cronRunning}
            className="h-8 text-xs gap-1.5 shadow-xs"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{cronRunning ? "Executing Cron..." : "Run Billing Day"}</span>
          </Button>

          {onSwitchToUser && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSwitchToUser}
              className="h-8 text-xs gap-1.5 bg-blue-50/50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              <User className="w-3.5 h-3.5" />
              <span>Switch to User Portal</span>
            </Button>
          )}
        </div>
      </div>

      {/* LIVE FINANCIAL ROLLUP CARDS (Reflects User Actions in Real Time!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Live MRR (From User Actions)</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-foreground font-mono">
            {fmtCurr(financials.mrr)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">
            Reflects {financials.activeSubscriptionsCount} active customer plan(s)
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Subscribed Customers</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-foreground font-mono">
            {financials.totalCustomersCount}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {financials.activeSubscriptionsCount} active subscription contract(s)
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Cash Collections</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono">
            {fmtCurr(financials.totalCollections)}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Reconciled user payments via API
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Pending Receivables</span>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </div>
          <div className="text-2xl font-extrabold text-destructive font-mono">
            {fmtCurr(financials.overdueReceivables)}
          </div>
          <div className="text-[11px] text-destructive font-medium">
            {financials.overdueCount} invoice(s) pending payment
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b space-x-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-2.5 px-3 border-b-2 transition-all ${
            activeTab === "overview"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Executive Overview &amp; Live Stream
        </button>
        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`pb-2.5 px-3 border-b-2 transition-all ${
            activeTab === "subscriptions"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Customer Subscriptions ({subscriptions.length})
        </button>
        <button
          onClick={() => setActiveTab("invoices")}
          className={`pb-2.5 px-3 border-b-2 transition-all ${
            activeTab === "invoices"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Invoices &amp; Receivables ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-2.5 px-3 border-b-2 transition-all ${
            activeTab === "audit"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Live User Action Audit Trail ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab("organization")}
          className={`pb-2.5 px-3 border-b-2 transition-all ${
            activeTab === "organization"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Organization &amp; Subsidiaries ({company?.subsidiaries?.length || 0})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & SPLIT STREAM */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Subscriptions Stream */}
          <div className="p-5 border rounded-xl bg-card shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Live Customer Contracts</span>
              </h3>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live API Sync
              </span>
            </div>

            {subscriptions.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                <p>No customer subscriptions exist in the database yet.</p>
                <p className="text-[11px]">
                  Click <strong>&ldquo;Switch to User Portal&rdquo;</strong> above, select a plan, and click <strong>&ldquo;Subscribe Now&rdquo;</strong> to witness the live reflection here!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {subscriptions.slice(0, 5).map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors flex justify-between items-center text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-blue-600">{sub.id}</span>
                        <span className="font-semibold text-foreground">{sub.customer_name}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {sub.plan_name} &bull; Next Due: <span className="font-mono">{sub.next_billing_date}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-mono font-bold text-foreground">{fmtCurr(sub.grand_total)}</div>
                      <div>{getStatusBadge(sub.status)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live User Action Audit Feed */}
          <div className="p-5 border rounded-xl bg-card shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>Live User Action Stream (Audit Log)</span>
              </h3>
              <span className="text-[10px] text-blue-600 font-mono">
                {auditLogs.length} events
              </span>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {auditLogs.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 border rounded-lg bg-muted/20 text-xs space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">{log.actor}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{log.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{log.details}</div>
                  <div className="flex items-center space-x-2 text-[10px]">
                    <span className="font-mono font-bold text-blue-600">{log.entity}</span>
                    <Badge variant="outline" className="text-[9px] py-0 px-1">
                      {log.action}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUBSCRIPTIONS */}
      {activeTab === "subscriptions" && (
        <div className="border rounded-xl bg-card overflow-hidden shadow-xs">
          <div className="p-4 border-b flex justify-between items-center bg-muted/20">
            <h3 className="font-bold text-sm text-foreground">All Subscriptions (Live API)</h3>
            <span className="text-xs text-muted-foreground">Showing {subscriptions.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="p-3 text-left font-semibold text-muted-foreground">ID</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Customer</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Plan &amp; Products</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Frequency</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Next Billing</th>
                  <th className="p-3 text-right font-semibold text-muted-foreground">Grand Total</th>
                  <th className="p-3 text-right font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No subscriptions created yet. Switch to User Portal to subscribe.
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-600">{sub.id}</td>
                      <td className="p-3 font-medium text-foreground">{sub.customer_name}</td>
                      <td className="p-3">
                        <div className="font-medium text-foreground">{sub.plan_name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {sub.items.map((i) => `${i.product_name} (${i.variant_name || "Standard"})`).join(", ")}
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{sub.frequency}</td>
                      <td className="p-3 font-mono text-muted-foreground">{sub.next_billing_date}</td>
                      <td className="p-3 text-right font-mono font-bold">{fmtCurr(sub.grand_total)}</td>
                      <td className="p-3 text-right">{getStatusBadge(sub.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INVOICES & RECEIVABLES */}
      {activeTab === "invoices" && (
        <div className="border rounded-xl bg-card overflow-hidden shadow-xs">
          <div className="p-4 border-b flex justify-between items-center bg-muted/20">
            <h3 className="font-bold text-sm text-foreground">Accounts Receivable &amp; Invoices</h3>
            <span className="text-xs text-muted-foreground">Showing {invoices.length} invoices</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Invoice ID</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Customer</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Period</th>
                  <th className="p-3 text-right font-semibold text-muted-foreground">Grand Total</th>
                  <th className="p-3 text-right font-semibold text-muted-foreground">Paid Amount</th>
                  <th className="p-3 text-right font-semibold text-muted-foreground">Balance Due</th>
                  <th className="p-3 text-right font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No invoices issued yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-600">{inv.id}</td>
                      <td className="p-3">{getStatusBadge(inv.status)}</td>
                      <td className="p-3 font-medium text-foreground">{inv.customer_name}</td>
                      <td className="p-3 text-muted-foreground">{inv.billing_period_start} to {inv.billing_period_end}</td>
                      <td className="p-3 text-right font-mono font-semibold">{fmtCurr(inv.grand_total)}</td>
                      <td className="p-3 text-right font-mono text-emerald-600 font-medium">{fmtCurr(inv.paid_amount)}</td>
                      <td className="p-3 text-right font-mono font-bold">
                        <span className={inv.outstanding_amount > 0 ? "text-destructive" : "text-emerald-600"}>
                          {fmtCurr(inv.outstanding_amount)}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="subtle"
                          size="sm"
                          onClick={() => setPreviewInv(inv)}
                          className="h-7 px-2 text-xs"
                        >
                          View Receipt
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === "audit" && (
        <div className="border rounded-xl bg-card overflow-hidden shadow-xs">
          <div className="p-4 border-b flex justify-between items-center bg-muted/20">
            <h3 className="font-bold text-sm text-foreground">Live User Action Audit Ledger</h3>
            <span className="text-xs text-muted-foreground">{auditLogs.length} events logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="p-3 text-left font-semibold text-muted-foreground">ID</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Timestamp</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Actor</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Action</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Entity</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-muted-foreground">{log.id}</td>
                    <td className="p-3 font-mono text-muted-foreground whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3 font-semibold text-foreground">{log.actor}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono font-bold text-blue-600">{log.entity}</td>
                    <td className="p-3 text-muted-foreground">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ORGANIZATION & MULTI-COMPANY */}
      {activeTab === "organization" && (
        <CompanyWorkspaceView />
      )}

      {/* Invoice Preview Modal */}
      {previewInv && (
        <InvoicePreviewModal />
      )}
    </div>
  );
};
