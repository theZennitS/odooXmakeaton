"use client";

import React from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fmtCurr } from "@/lib/utils";
import { UserCheck, ShieldCheck, Pause, Play, XCircle, Printer } from "lucide-react";

export const CustomerPortalView: React.FC = () => {
  const { state, updateSubStatus, setPreviewInvoice, addToast } = useBrightloop();

  // Data isolation: Brooklyn Zoe only
  const mySubs = state.subscriptions.filter((s) =>
    s.customer_name.toLowerCase().includes("brooklyn")
  );
  const myInvs = state.invoices.filter((i) =>
    i.customer_name.toLowerCase().includes("brooklyn")
  );

  const togglePause = (subId: string, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Paused" : "Active";
    updateSubStatus(subId, newStatus as any);
  };

  const cancelPlan = (subId: string) => {
    if (window.confirm("Are you sure you wish to cancel this subscription plan?")) {
      updateSubStatus(subId, "Closed");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="success">Active</Badge>;
      case "Paused":
        return <Badge variant="secondary">Paused</Badge>;
      case "Closed":
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 border rounded-xl bg-gradient-to-r from-blue-50/60 to-background border-blue-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Customer Portal &mdash; Brooklyn Zoe
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Self-service dashboard: view active software subscriptions, pause/renew, and download official tax receipts.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-full border border-blue-200 self-start sm:self-center">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Customer Isolation Active</span>
        </div>
      </div>

      {/* Split Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Subscriptions */}
        <div className="p-5 border rounded-xl bg-card shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-foreground border-b pb-2">
            My Subscriptions ({mySubs.length})
          </h3>

          <div className="space-y-3">
            {mySubs.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No active subscriptions found for this account.
              </p>
            ) : (
              mySubs.map((s) => (
                <div
                  key={s.id}
                  className="p-4 border rounded-lg bg-muted/20 space-y-3 hover:border-border transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{s.plan_name}</h4>
                      <p className="font-mono text-xs text-muted-foreground">{s.id}</p>
                    </div>
                    {getStatusBadge(s.status)}
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>
                      Next Scheduled Billing:{" "}
                      <strong className="text-foreground font-mono">{s.next_billing_date}</strong>
                    </div>
                    <div>
                      Amount:{" "}
                      <strong className="text-foreground font-mono">
                        {fmtCurr(s.grand_total)}
                      </strong>{" "}
                      / {s.frequency.toLowerCase()}
                    </div>
                  </div>

                  {s.status !== "Closed" && (
                    <div className="flex space-x-2 pt-1 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePause(s.id, s.status)}
                        className="h-7 text-xs gap-1"
                      >
                        {s.status === "Active" ? (
                          <>
                            <Pause className="w-3 h-3" />
                            <span>Pause Plan</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3" />
                            <span>Resume Plan</span>
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelPlan(s.id)}
                        className="h-7 text-xs gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Cancel Plan</span>
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Invoices & Receipts */}
        <div className="p-5 border rounded-xl bg-card shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-foreground border-b pb-2">
            My Invoices &amp; Receipts ({myInvs.length})
          </h3>

          <div className="space-y-2.5">
            {myInvs.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No invoices issued yet.
              </p>
            ) : (
              myInvs.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-blue-600">
                        {inv.id}
                      </span>
                      <span className="text-xs text-muted-foreground">&bull; {inv.invoice_date}</span>
                    </div>
                    <div className="text-xs font-mono font-medium">
                      {inv.outstanding_amount > 0 ? (
                        <span className="text-destructive">
                          Due: {fmtCurr(inv.outstanding_amount)}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">
                          Paid in Full ({fmtCurr(inv.grand_total)})
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => setPreviewInvoice(inv)}
                    className="h-7 text-xs gap-1"
                  >
                    <Printer className="w-3 h-3" />
                    <span>View Receipt</span>
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
