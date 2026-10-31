"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Subscription, Invoice, Plan } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { fmtCurr } from "@/lib/utils";
import {
  User,
  Package,
  CreditCard,
  Receipt,
  Pause,
  Play,
  XCircle,
  Plus,
  Printer,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  LogOut,
  RefreshCw,
  Building,
} from "lucide-react";
import { InvoicePreviewModal } from "@/components/modals/invoice-preview-modal";

interface UserPortalProps {
  onSwitchToCompany?: () => void;
}

export const UserPortal: React.FC<UserPortalProps> = ({ onSwitchToCompany }) => {
  const { user, logout, setAuthModalOpen } = useAuth();

  const customerName = user?.name || "Brooklyn Zoe";
  const customerEmail = user?.email || "brooklyn@zoe.io";

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string>("Brand: Odoo Compatibility Layer");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("PLAN-PRO-ODOO");
  const [subscribing, setSubscribing] = useState(false);
  const [previewInv, setPreviewInv] = useState<Invoice | null>(null);

  // Quick payment state
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedInvForPay, setSelectedInvForPay] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState("Credit Card");
  const [paying, setPaying] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "info" | "warning" } | null>(null);

  const showToast = (text: string, type: "success" | "info" | "warning" = "info") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, invRes] = await Promise.all([
        fetch(`/api/subscriptions?customerName=${encodeURIComponent(customerName)}`),
        fetch(`/api/invoices?customerName=${encodeURIComponent(customerName)}`),
      ]);

      const subData = await subRes.json();
      const invData = await invRes.json();

      if (subData.subscriptions) setSubscriptions(subData.subscriptions);
      if (subData.plans) setPlans(subData.plans);
      if (invData.invoices) setInvoices(invData.invoices);
    } catch (err) {
      console.error("Error fetching user portal data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [customerName]);

  // Subscribe to plan via API
  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const isOdoo = selectedVariant.includes("Odoo");
      const unitPrice = 350 + (isOdoo ? 560 : selectedVariant.includes("Multi") ? 300 : 0);

      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          customer_address: "302 Snider Street, RUTLAND, VT, 05701",
          plan_id: selectedPlanId,
          status: "Active",
          items: [
            {
              product_id: "PROD-01",
              product_name: "Brightloop Core ERP",
              variant_name: selectedVariant,
              base_price: 350,
              quantity: 1,
            },
          ],
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Subscribed successfully! Reflected in Company Portal immediately.`, "success");
        await fetchData();
      } else {
        showToast(data.error || "Subscription failed", "warning");
      }
    } catch (e: any) {
      showToast(e.message || "Failed to subscribe", "warning");
    } finally {
      setSubscribing(false);
    }
  };

  // Toggle pause/resume via API
  const handleTogglePause = async (sub: Subscription) => {
    const nextStatus = sub.status === "Active" ? "Paused" : "Active";
    try {
      const res = await fetch(`/api/subscriptions/${sub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          actorName: customerName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Subscription ${sub.id} is now ${nextStatus}`, "success");
        await fetchData();
      }
    } catch (e: any) {
      showToast(e.message, "warning");
    }
  };

  // Cancel plan via API
  const handleCancelPlan = async (sub: Subscription) => {
    if (!window.confirm(`Are you sure you wish to cancel subscription ${sub.id}?`)) return;
    try {
      const res = await fetch(`/api/subscriptions/${sub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Closed",
          actorName: customerName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Subscription ${sub.id} closed.`, "info");
        await fetchData();
      }
    } catch (e: any) {
      showToast(e.message, "warning");
    }
  };

  // Submit payment via API
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvForPay) return;
    setPaying(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: selectedInvForPay.id,
          amount: payAmount,
          payment_method: payMethod,
          actorName: customerName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Payment of ${fmtCurr(payAmount)} received! Balance reconciled.`, "success");
        setPayModalOpen(false);
        await fetchData();
      } else {
        showToast(data.error || "Payment failed", "warning");
      }
    } catch (e: any) {
      showToast(e.message, "warning");
    } finally {
      setPaying(false);
    }
  };

  const openPay = (inv: Invoice) => {
    setSelectedInvForPay(inv);
    setPayAmount(inv.outstanding_amount);
    setPayModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="success">Active</Badge>;
      case "Paused":
        return <Badge variant="secondary">Paused</Badge>;
      case "Closed":
        return <Badge variant="outline">Closed</Badge>;
      case "Paid":
        return <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Paid</Badge>;
      case "Overdue":
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" /> Overdue</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-16 right-4 z-50 p-3 bg-blue-600 text-white rounded-lg shadow-xl text-xs font-semibold animate-in slide-in-from-top-2">
          {toastMsg.text}
        </div>
      )}

      {/* Top Banner with Identity & Portal Mode Switch */}
      <div className="p-5 border rounded-xl bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-background border-blue-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {customerName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Customer Portal &mdash; {customerName}
              </h1>
              <p className="text-xs text-muted-foreground">{customerEmail} &bull; Self-Service Account</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="h-8 text-xs gap-1"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </Button>

          {onSwitchToCompany && (
            <Button
              variant="blue"
              size="sm"
              onClick={onSwitchToCompany}
              className="h-8 text-xs gap-1.5 shadow-xs"
            >
              <Building className="w-3.5 h-3.5" />
              <span>Switch to Company Portal</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAuthModalOpen(true)}
            className="h-8 text-xs text-muted-foreground"
          >
            Account
          </Button>
        </div>
      </div>

      {/* SECTION 1: SUBSCRIBE TO A PLAN (Real API POST) */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3 border-b bg-muted/10">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <span>Subscribe to a Plan &amp; Customize Add-ons</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4 text-xs">
          <p className="text-muted-foreground">
            Select a software plan and choose your brand add-on. Clicking <strong>Subscribe Now</strong> sends a real API request to the backend and instantly reflects in the Company Portal revenue dashboard.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground uppercase text-[10px]">Plan Selection</label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full h-9 rounded-md border bg-background px-3 text-xs focus:outline-none"
              >
                <option value="PLAN-PRO-ODOO">Professional (Monthly - $350.00 base)</option>
                <option value="PLAN-STARTER">Starter Business (Monthly - $99.00)</option>
                <option value="PLAN-ENTERPRISE">Enterprise Annual (Yearly - $4,500.00)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                Brand Variant Surcharge
              </label>
              <select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className="w-full h-9 rounded-md border bg-background px-3 text-xs focus:outline-none font-medium"
              >
                <option value="Brand: Odoo Compatibility Layer">
                  Brand: Odoo Compatibility Layer (+$560.00) &mdash; Featured
                </option>
                <option value="Standard Edition">Standard Edition (+$0.00)</option>
                <option value="Enterprise Multi-Company">Enterprise Multi-Company (+$300.00)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t bg-muted/10 p-3 rounded-lg">
            <div>
              <div className="text-xs text-muted-foreground">Estimated Monthly Total:</div>
              <div className="text-xl font-extrabold text-blue-600 font-mono">
                {selectedVariant.includes("Odoo") ? "$1,073.80" : selectedVariant.includes("Multi") ? "$767.00" : "$413.00"}{" "}
                <span className="text-xs font-normal text-muted-foreground">(incl. 18% VAT)</span>
              </div>
            </div>

            <Button
              onClick={handleSubscribe}
              disabled={subscribing}
              variant="blue"
              className="gap-1.5 text-xs shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{subscribing ? "Subscribing..." : "Subscribe Now (API)"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: MY ACTIVE SUBSCRIPTIONS */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          My Subscriptions ({subscriptions.length})
        </h2>

        {subscriptions.length === 0 ? (
          <div className="p-8 border rounded-xl bg-card text-center text-xs text-muted-foreground">
            No active subscriptions yet. Choose a plan above and click &ldquo;Subscribe Now&rdquo; to start.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="p-4 border rounded-xl bg-card shadow-xs space-y-3 hover:border-border transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{sub.plan_name}</h3>
                    <p className="font-mono text-xs text-blue-600 font-semibold">{sub.id}</p>
                  </div>
                  {getStatusBadge(sub.status)}
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div>
                    Items:{" "}
                    <strong className="text-foreground">
                      {sub.items.map((i) => `${i.product_name} (${i.variant_name || "Standard"})`).join(", ")}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Renewal Date:</span>
                    <strong className="text-foreground font-mono">{sub.next_billing_date}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <strong className="text-foreground font-mono">
                      {fmtCurr(sub.grand_total)} / {sub.frequency.toLowerCase()}
                    </strong>
                  </div>
                </div>

                {sub.status !== "Closed" && (
                  <div className="flex space-x-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePause(sub)}
                      className="h-7 text-xs gap-1 flex-1"
                    >
                      {sub.status === "Active" ? (
                        <>
                          <Pause className="w-3 h-3 text-amber-600" />
                          <span>Pause Plan</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 text-emerald-600" />
                          <span>Resume Plan</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelPlan(sub)}
                      className="h-7 text-xs gap-1 text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Cancel</span>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: MY INVOICES & PAYMENTS */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          My Invoices &amp; Payments ({invoices.length})
        </h2>

        {invoices.length === 0 ? (
          <div className="p-8 border rounded-xl bg-card text-center text-xs text-muted-foreground">
            No invoices issued yet.
          </div>
        ) : (
          <div className="border rounded-xl bg-card overflow-hidden shadow-xs">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Invoice ID</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Date</th>
                  <th className="p-3 text-right font-semibold text-muted-foreground">Grand Total</th>
                  <th className="p-3 text-right font-semibold text-muted-foreground">Balance Due</th>
                  <th className="p-3 text-right font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-600">{inv.id}</td>
                    <td className="p-3">{getStatusBadge(inv.status)}</td>
                    <td className="p-3 text-muted-foreground">{inv.invoice_date}</td>
                    <td className="p-3 text-right font-mono font-semibold">{fmtCurr(inv.grand_total)}</td>
                    <td className="p-3 text-right font-mono font-bold">
                      <span className={inv.outstanding_amount > 0 ? "text-destructive" : "text-emerald-600"}>
                        {fmtCurr(inv.outstanding_amount)}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      {inv.outstanding_amount > 0 && (
                        <Button
                          variant="blue"
                          size="sm"
                          onClick={() => openPay(inv)}
                          className="h-7 px-2.5 text-xs shadow-xs"
                        >
                          <CreditCard className="w-3 h-3 mr-1" />
                          Pay Balance
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewInv(inv)}
                        className="h-7 px-2 text-xs"
                        title="Print / View Invoice"
                      >
                        <Printer className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pay Modal */}
      {payModalOpen && selectedInvForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSubmitPayment}
            className="bg-background border rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Pay Invoice {selectedInvForPay.id}</span>
              </h3>
              <button
                type="button"
                onClick={() => setPayModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Outstanding Balance:</span>
                <strong className="text-destructive font-mono text-sm">
                  {fmtCurr(selectedInvForPay.outstanding_amount)}
                </strong>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                  Payment Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedInvForPay.outstanding_amount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 rounded-md border bg-background px-3 text-xs font-mono font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                  Payment Mode
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full h-9 rounded-md border bg-background px-3 text-xs"
                >
                  <option value="Credit Card">Credit Card (Stripe / Visa)</option>
                  <option value="Bank Transfer">Direct Bank Wire (SVB)</option>
                  <option value="Instant Gateway / UPI">Instant Gateway / UPI</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setPayModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={paying} variant="blue" size="sm">
                {paying ? "Processing..." : `Pay ${fmtCurr(payAmount)} (API)`}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Invoice Preview */}
      {previewInv && (
        <InvoicePreviewModal />
      )}
    </div>
  );
};
