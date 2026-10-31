"use client";

import React, { useState, useEffect } from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { Search, ArrowRight, FileText, Zap, CreditCard, LayoutDashboard, Tag, Layers, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const AwesomeBarModal: React.FC = () => {
  const {
    isAwesomeBarOpen,
    setIsAwesomeBarOpen,
    navigateTo,
    createSubscriptionDoc,
    openPaymentModal,
    triggerBillingDay,
    state,
  } = useBrightloop();

  const [query, setQuery] = useState("");

  useEffect(() => {
    if (isAwesomeBarOpen) {
      setQuery("");
    }
  }, [isAwesomeBarOpen]);

  if (!isAwesomeBarOpen) return null;

  const actions = [
    {
      id: "act-new-sub",
      label: "New Customer Subscription",
      category: "Action",
      icon: <FileText className="w-4 h-4 text-blue-500" />,
      run: () => {
        setIsAwesomeBarOpen(false);
        createSubscriptionDoc();
      },
    },
    {
      id: "act-cron",
      label: "Run Billing Day Cron",
      category: "Cron Scheduler",
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      run: () => {
        setIsAwesomeBarOpen(false);
        triggerBillingDay();
      },
    },
    {
      id: "act-pay",
      label: "Record Payment Entry",
      category: "Action",
      icon: <CreditCard className="w-4 h-4 text-emerald-500" />,
      run: () => {
        setIsAwesomeBarOpen(false);
        openPaymentModal();
      },
    },
    {
      id: "act-nav-subs",
      label: "Go to Subscriptions List",
      category: "Workspace",
      icon: <Layers className="w-4 h-4 text-slate-500" />,
      run: () => {
        setIsAwesomeBarOpen(false);
        navigateTo("subscriptions", "list");
      },
    },
    {
      id: "act-nav-analytics",
      label: "Go to Finance Analytics",
      category: "Workspace",
      icon: <LayoutDashboard className="w-4 h-4 text-slate-500" />,
      run: () => {
        setIsAwesomeBarOpen(false);
        navigateTo("analytics");
      },
    },
    {
      id: "act-nav-billing",
      label: "Go to Subscription Invoices",
      category: "Workspace",
      icon: <FileText className="w-4 h-4 text-slate-500" />,
      run: () => {
        setIsAwesomeBarOpen(false);
        navigateTo("billing");
      },
    },
    {
      id: "act-nav-prods",
      label: "Go to Products & Plans",
      category: "Workspace",
      icon: <Layers className="w-4 h-4 text-slate-500" />,
      run: () => {
        setIsAwesomeBarOpen(false);
        navigateTo("products");
      },
    },
    {
      id: "act-nav-discounts",
      label: "Go to Discount Rules",
      category: "Workspace",
      icon: <Tag className="w-4 h-4 text-slate-500" />,
      run: () => {
        setIsAwesomeBarOpen(false);
        navigateTo("discounts");
      },
    },
    {
      id: "act-nav-portal",
      label: "Go to Customer Portal",
      category: "Portal",
      icon: <UserCheck className="w-4 h-4 text-indigo-500" />,
      run: () => {
        setIsAwesomeBarOpen(false);
        navigateTo("portal");
      },
    },
  ];

  // Append subscription docs
  state.subscriptions.forEach((s) => {
    actions.push({
      id: `doc-${s.id}`,
      label: `${s.id} — ${s.customer_name} (${s.plan_name})`,
      category: "Subscription Doc",
      icon: <FileText className="w-4 h-4 text-primary" />,
      run: () => {
        setIsAwesomeBarOpen(false);
        navigateTo("subscriptions", "form", s.id);
      },
    });
  });

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsAwesomeBarOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative z-50 w-full max-w-xl bg-background rounded-xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 border-b">
          <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
          <input
            type="text"
            className="w-full h-12 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Type a command or search documents (Ctrl + K)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No matching commands or documents found.
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={item.run}
                className="w-full flex items-center justify-between p-2.5 rounded-lg text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors group"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="shrink-0">{item.icon}</div>
                  <span className="truncate font-medium">{item.label}</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <Badge variant="secondary" className="text-[10px] font-normal">
                    {item.category}
                  </Badge>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
