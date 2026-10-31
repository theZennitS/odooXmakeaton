"use client";

import React from "react";
import { useBrightloop } from "@/context/brightloop-context";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Zap,
  CreditCard,
  LayoutDashboard,
  Tag,
  Layers,
  UserCheck,
} from "lucide-react";

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

  const quickActions = [
    {
      id: "act-new-sub",
      label: "New Customer Subscription",
      shortcut: "Quotation",
      icon: <FileText className="h-4 w-4" />,
      run: () => {
        setIsAwesomeBarOpen(false);
        createSubscriptionDoc();
      },
    },
    {
      id: "act-cron",
      label: "Run Billing Day Cron",
      shortcut: "Scheduler",
      icon: <Zap className="h-4 w-4" />,
      run: () => {
        setIsAwesomeBarOpen(false);
        triggerBillingDay();
      },
    },
    {
      id: "act-pay",
      label: "Record Payment Entry",
      shortcut: "Accounting",
      icon: <CreditCard className="h-4 w-4" />,
      run: () => {
        setIsAwesomeBarOpen(false);
        openPaymentModal();
      },
    },
  ];

  const workspaceItems = [
    {
      id: "act-nav-subs",
      label: "Go to Subscriptions List",
      icon: <Layers className="h-4 w-4" />,
      run: () => {
        setIsAwesomeBarOpen(false);
        navigateTo("subscriptions", "list");
      },
    },
    {
      id: "act-nav-billing",
      label: "Go to Subscription Invoices",
      icon: <FileText className="h-4 w-4" />,
      run: () => {
        setIsAwesomeBarOpen(false);
        navigateTo("billing");
      },
    },
    {
      id: "act-nav-prods",
      label: "Go to Products & Plans",
      icon: <Layers className="h-4 w-4" />,
      run: () => {
        setIsAwesomeBarOpen(false);
        navigateTo("products");
      },
    },
    {
      id: "act-nav-discounts",
      label: "Go to Discount Rules",
      icon: <Tag className="h-4 w-4" />,
      run: () => {
        setIsAwesomeBarOpen(false);
        navigateTo("discounts");
      },
    },
    {
      id: "act-nav-analytics",
      label: "Go to Finance Analytics",
      icon: <LayoutDashboard className="h-4 w-4" />,
      run: () => {
        setIsAwesomeBarOpen(false);
        navigateTo("analytics");
      },
    },
    {
      id: "act-nav-portal",
      label: "Go to Customer Portal",
      icon: <UserCheck className="h-4 w-4" />,
      run: () => {
        setIsAwesomeBarOpen(false);
        navigateTo("portal");
      },
    },
  ];

  return (
    <CommandDialog open={isAwesomeBarOpen} onOpenChange={setIsAwesomeBarOpen}>
      <CommandInput placeholder="Type a command or search documents..." />
      <CommandList>
        <CommandEmpty>No matching commands or documents found.</CommandEmpty>
        <CommandGroup heading="Quick Actions">
          {quickActions.map((item) => (
            <CommandItem key={item.id} onSelect={item.run}>
              {item.icon}
              <span>{item.label}</span>
              <CommandShortcut>{item.shortcut}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Workspaces">
          {workspaceItems.map((item) => (
            <CommandItem key={item.id} onSelect={item.run}>
              {item.icon}
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Subscription Documents">
          {state.subscriptions.map((s) => (
            <CommandItem
              key={s.id}
              value={`${s.id} ${s.customer_name} ${s.plan_name}`}
              onSelect={() => {
                setIsAwesomeBarOpen(false);
                navigateTo("subscriptions", "form", s.id);
              }}
            >
              <FileText className="h-4 w-4" />
              <span className="truncate">
                {s.id} — {s.customer_name} ({s.plan_name})
              </span>
              <CommandShortcut>
                <Badge variant="outline" className="text-[10px] font-normal">
                  {s.status}
                </Badge>
              </CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
