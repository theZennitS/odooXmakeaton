"use client";

import React, { useState } from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fmtCurr } from "@/lib/utils";
import {
  Search,
  CreditCard,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

export const BillingInvoicesView: React.FC = () => {
  const { state, openPaymentModal, setPreviewInvoice } = useBrightloop();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  let list = state.invoices;

  if (statusFilter !== "all") {
    list = list.filter(
      (i) => i.status.toLowerCase() === statusFilter.toLowerCase()
    );
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

        <Button onClick={() => openPaymentModal()} size="sm" className="text-xs">
          <CreditCard className="h-4 w-4" />
          <span>Record Payment</span>
        </Button>
      </div>

      {/* Official shadcn Card wrapping Filter Bar + Table */}
      <Card>
        <CardHeader className="p-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative min-w-[220px] max-w-sm flex-1">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by Invoice ID or Customer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>

              <div className="w-44">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Status: All</SelectItem>
                    <SelectItem value="Confirmed">
                      Confirmed (Unpaid)
                    </SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Showing {list.length} invoices
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Invoice ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Billing Period</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Grand Total</TableHead>
                <TableHead className="text-right">Balance Due</TableHead>
                <TableHead className="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No invoices matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="pl-4">
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setPreviewInvoice(inv)}
                        className="h-auto p-0 font-mono font-semibold text-xs"
                      >
                        {inv.id}
                      </Button>
                    </TableCell>
                    <TableCell>{getStatusBadge(inv.status)}</TableCell>
                    <TableCell className="font-mono text-muted-foreground text-xs">
                      {inv.subscription_id}
                    </TableCell>
                    <TableCell className="font-medium text-xs">
                      {inv.customer_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {inv.billing_period_start} to {inv.billing_period_end}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {inv.due_date}
                    </TableCell>
                    <TableCell className="text-right font-semibold font-mono text-xs">
                      {fmtCurr(inv.grand_total)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs">
                      <span
                        className={
                          inv.outstanding_amount > 0
                            ? "text-destructive"
                            : "text-emerald-600"
                        }
                      >
                        {fmtCurr(inv.outstanding_amount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-4 space-x-1">
                      {inv.outstanding_amount > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPaymentModal(inv.id)}
                          className="h-7 px-2 text-xs"
                        >
                          Pay
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPreviewInvoice(inv)}
                        className="h-7 px-2 text-xs"
                      >
                        <Printer className="h-3 w-3" />
                        <span>Print</span>
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
  );
};
