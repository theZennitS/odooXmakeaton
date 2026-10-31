"use client";

import React, { useState } from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fmtCurr } from "@/lib/utils";
import { Plus, Search, RefreshCw, ChevronRight } from "lucide-react";

export const SubscriptionListView: React.FC = () => {
  const { state, currentRole, navigateTo, createSubscriptionDoc } =
    useBrightloop();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  let list = state.subscriptions;

  if (currentRole === "Customer") {
    list = list.filter((s) =>
      s.customer_name.toLowerCase().includes("brooklyn")
    );
  }

  if (statusFilter !== "all") {
    list = list.filter(
      (s) => s.status.toLowerCase() === statusFilter.toLowerCase()
    );
  }

  if (planFilter !== "all") {
    list = list.filter((s) => s.plan_id === planFilter);
  }

  if (search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.customer_name.toLowerCase().includes(q) ||
        s.plan_name.toLowerCase().includes(q)
    );
  }

  const allSelected =
    list.length > 0 && list.every((sub) => selectedIds.includes(sub.id));

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(list.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="default">Active</Badge>;
      case "Quotation":
        return <Badge variant="secondary">Quotation</Badge>;
      case "Confirmed":
        return <Badge variant="secondary">Confirmed</Badge>;
      case "Overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "Paused":
        return <Badge variant="outline">Paused</Badge>;
      case "Closed":
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-4">
        {/* View Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Customer Subscriptions
            </h1>
            <p className="text-xs text-muted-foreground">
              Manage contract lifecycles, recurring intervals, and product variant add-ons.
            </p>
          </div>

          <Button
            onClick={() => createSubscriptionDoc()}
            size="sm"
            className="text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Customer Subscription</span>
          </Button>
        </div>

        {/* Official shadcn Card wrapping Filters + Data Table */}
        <Card>
          <CardHeader className="p-4 border-b">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <div className="relative min-w-[220px] max-w-sm flex-1">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by ID, Customer or Plan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>

                <div className="w-40">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Status: All</SelectItem>
                      <SelectItem value="Active">Status: Active</SelectItem>
                      <SelectItem value="Quotation">
                        Status: Quotation
                      </SelectItem>
                      <SelectItem value="Confirmed">
                        Status: Confirmed
                      </SelectItem>
                      <SelectItem value="Overdue">Status: Overdue</SelectItem>
                      <SelectItem value="Paused">Status: Paused</SelectItem>
                      <SelectItem value="Closed">Status: Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-48">
                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Filter plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Plan: All Plans</SelectItem>
                      {state.plans.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground self-end lg:self-center">
                <span>Showing {list.length} records</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setSearch("");
                        setStatusFilter("all");
                        setPlanFilter("all");
                      }}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reset Filters</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 pl-4">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(checked) =>
                        toggleSelectAll(Boolean(checked))
                      }
                      aria-label="Select all subscriptions"
                    />
                  </TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Plan &amp; Products</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Next Billing</TableHead>
                  <TableHead className="text-right">Grand Total</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No subscriptions matching criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((sub) => (
                    <TableRow
                      key={sub.id}
                      data-state={
                        selectedIds.includes(sub.id) ? "selected" : undefined
                      }
                      onClick={() =>
                        navigateTo("subscriptions", "form", sub.id)
                      }
                      className="cursor-pointer group"
                    >
                      <TableCell
                        className="pl-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedIds.includes(sub.id)}
                          onCheckedChange={(checked) =>
                            toggleSelectRow(sub.id, Boolean(checked))
                          }
                          aria-label={`Select ${sub.id}`}
                        />
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-primary text-xs group-hover:underline">
                        {sub.id}
                      </TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell className="font-medium text-xs">
                        {sub.customer_name}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-xs">
                          {sub.plan_name}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-xs">
                          {sub.items
                            .map(
                              (i) =>
                                `${i.product_name} (${i.variant_name || "Standard"})`
                            )
                            .join(", ")}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {sub.frequency}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {sub.next_billing_date || "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-xs">
                        {fmtCurr(sub.grand_total)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity inline" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>

          <CardFooter className="p-3 border-t flex items-center justify-between text-xs text-muted-foreground">
            <div>
              {selectedIds.length > 0
                ? `${selectedIds.length} of ${list.length} row(s) selected`
                : `1 - ${list.length} of ${list.length}`}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled
                className="h-7 px-2 text-xs"
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="h-7 px-2 text-xs"
              >
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </TooltipProvider>
  );
};
