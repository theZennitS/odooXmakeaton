"use client";

import React, { useState } from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { fmtCurr } from "@/lib/utils";
import { Plus, Search, RefreshCw, ChevronRight, Filter } from "lucide-react";

export const SubscriptionListView: React.FC = () => {
  const { state, currentRole, navigateTo, createSubscriptionDoc } = useBrightloop();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  let list = state.subscriptions;

  // Role isolation for Customer
  if (currentRole === "Customer") {
    list = list.filter((s) => s.customer_name.toLowerCase().includes("brooklyn"));
  }

  // Filter by status
  if (statusFilter !== "all") {
    list = list.filter((s) => s.status.toLowerCase() === statusFilter.toLowerCase());
  }

  // Filter by plan
  if (planFilter !== "all") {
    list = list.filter((s) => s.plan_id === planFilter);
  }

  // Search
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.customer_name.toLowerCase().includes(q) ||
        s.plan_name.toLowerCase().includes(q)
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="success">Active</Badge>;
      case "Quotation":
        return <Badge variant="warning">Quotation</Badge>;
      case "Confirmed":
        return <Badge variant="info">Confirmed</Badge>;
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
    <div className="space-y-4">
      {/* View Header with Action Button */}
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
          variant="blue"
          className="gap-1.5 shadow-sm text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer Subscription</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-muted/20 border rounded-xl">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by ID, Customer or Plan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-background"
            />
          </div>

          <div className="w-36">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 text-xs bg-background"
            >
              <option value="all">Status: All</option>
              <option value="Active">Status: Active</option>
              <option value="Quotation">Status: Quotation</option>
              <option value="Confirmed">Status: Confirmed</option>
              <option value="Overdue">Status: Overdue</option>
              <option value="Paused">Status: Paused</option>
              <option value="Closed">Status: Closed</option>
            </Select>
          </div>

          <div className="w-48">
            <Select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="h-8 text-xs bg-background"
            >
              <option value="all">Plan: All Plans</option>
              {state.plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-muted-foreground self-end lg:self-center">
          <span>Showing {list.length} records</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setPlanFilter("all");
            }}
            title="Reset Filters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Modern Data Table */}
      <div className="border rounded-xl bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="p-3 text-left font-semibold text-muted-foreground w-10">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="p-3 text-left font-semibold text-muted-foreground">ID</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Status</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Customer</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Plan &amp; Products</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Frequency</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Next Billing</th>
                <th className="p-3 text-right font-semibold text-muted-foreground">Grand Total</th>
                <th className="p-3 text-right font-semibold text-muted-foreground w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground text-sm">
                    No subscriptions matching criteria.
                  </td>
                </tr>
              ) : (
                list.map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => navigateTo("subscriptions", "form", sub.id)}
                    className="hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="p-3 font-mono font-semibold text-blue-600 group-hover:underline">
                      {sub.id}
                    </td>
                    <td className="p-3">{getStatusBadge(sub.status)}</td>
                    <td className="p-3 font-medium text-foreground">{sub.customer_name}</td>
                    <td className="p-3">
                      <div className="font-medium text-foreground">{sub.plan_name}</div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-xs">
                        {sub.items.map((i) => `${i.product_name} (${i.variant_name || "Standard"})`).join(", ")}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{sub.frequency}</td>
                    <td className="p-3 text-muted-foreground font-mono">{sub.next_billing_date || "—"}</td>
                    <td className="p-3 text-right font-semibold text-foreground">
                      {fmtCurr(sub.grand_total)}
                    </td>
                    <td className="p-3 text-right text-muted-foreground">
                      <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all inline" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <div>
            1 - {list.length} of {list.length}
          </div>
          <div className="space-x-1">
            <Button variant="outline" size="sm" disabled className="h-7 px-2 text-xs">
              Prev
            </Button>
            <Button variant="outline" size="sm" disabled className="h-7 px-2 text-xs">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

