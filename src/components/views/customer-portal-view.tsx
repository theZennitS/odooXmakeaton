"use client";

import React from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fmtCurr } from "@/lib/utils";
import { UserCheck, ShieldCheck, Pause, Play, XCircle, Printer } from "lucide-react";

export const CustomerPortalView: React.FC = () => {
  const { state, updateSubStatus, setPreviewInvoice } = useBrightloop();

  // Data isolation: Brooklyn Zoe only
  const mySubs = state.subscriptions.filter((s) =>
    s.customer_name.toLowerCase().includes("brooklyn")
  );
  const myInvs = state.invoices.filter((i) =>
    i.customer_name.toLowerCase().includes("brooklyn")
  );

  const togglePause = (subId: string, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Paused" : "Active";
    updateSubStatus(subId, newStatus as "Active" | "Paused");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="default">Active</Badge>;
      case "Paused":
        return <Badge variant="secondary">Paused</Badge>;
      case "Closed":
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Portal Header Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                Customer Portal &mdash; Brooklyn Zoe
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Self-service dashboard: view active software subscriptions, pause or resume plans, and download official tax receipts.
            </CardDescription>
          </div>

          <Badge variant="secondary" className="gap-1.5 self-start sm:self-center">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Customer Isolation Active</span>
          </Badge>
        </CardHeader>
      </Card>

      {/* Split Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              My Subscriptions ({mySubs.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Manage your active recurring plans and billing preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mySubs.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No active subscriptions found for this account.
              </p>
            ) : (
              mySubs.map((s) => (
                <Card key={s.id} className="bg-muted/20 shadow-none">
                  <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="text-sm">{s.plan_name}</CardTitle>
                      <CardDescription className="font-mono text-xs">
                        {s.id}
                      </CardDescription>
                    </div>
                    {getStatusBadge(s.status)}
                  </CardHeader>

                  <CardContent className="p-4 pt-2 text-xs text-muted-foreground space-y-1">
                    <div>
                      Next Scheduled Billing:{" "}
                      <strong className="text-foreground font-mono">
                        {s.next_billing_date}
                      </strong>
                    </div>
                    <div>
                      Amount:{" "}
                      <strong className="text-foreground font-mono">
                        {fmtCurr(s.grand_total)}
                      </strong>{" "}
                      / {s.frequency.toLowerCase()}
                    </div>
                  </CardContent>

                  {s.status !== "Closed" && (
                    <>
                      <Separator />
                      <CardFooter className="p-3 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => togglePause(s.id, s.status)}
                          className="h-7 text-xs"
                        >
                          {s.status === "Active" ? (
                            <>
                              <Pause className="h-3 w-3" />
                              <span>Pause Plan</span>
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3" />
                              <span>Resume Plan</span>
                            </>
                          )}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs text-destructive hover:text-destructive"
                            >
                              <XCircle className="h-3 w-3" />
                              <span>Cancel Plan</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Cancel Subscription {s.id}?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you wish to cancel {s.plan_name}? Future recurring billing cycles will be stopped immediately.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Plan</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => updateSubStatus(s.id, "Closed")}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Confirm Cancellation
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardFooter>
                    </>
                  )}
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* My Invoices & Receipts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              My Invoices &amp; Receipts ({myInvs.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Official tax invoices and payment status for your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myInvs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No invoices issued yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  myInvs.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="pl-6 font-mono font-semibold text-xs text-primary">
                        {inv.id}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {inv.invoice_date}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {inv.outstanding_amount > 0 ? (
                          <Badge variant="destructive">
                            Due: {fmtCurr(inv.outstanding_amount)}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Paid ({fmtCurr(inv.grand_total)})
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setPreviewInvoice(inv)}
                          className="h-7 text-xs"
                        >
                          <Printer className="h-3 w-3" />
                          <span>Receipt</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
