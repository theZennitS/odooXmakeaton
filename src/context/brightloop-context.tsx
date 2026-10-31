"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  BrightloopState,
  WorkspaceId,
  Role,
  Subscription,
  Invoice,
  DiscountRule,
  SubscriptionStatus,
} from "@/types";
import { INITIAL_STATE } from "@/lib/initial-data";
import { runBillingDay, recordPayment } from "@/lib/engine";

const STORAGE_KEY = "brightloop_frappe_desk_next_v1";

interface Toast {
  id: string;
  message: string;
  type: "success" | "warning" | "info" | "error";
}

interface BrightloopContextType {
  state: BrightloopState;
  currentWorkspace: WorkspaceId;
  setCurrentWorkspace: (ws: WorkspaceId) => void;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  activeDocId: string | null;
  setActiveDocId: (id: string | null) => void;
  viewMode: "list" | "form";
  setViewMode: (mode: "list" | "form") => void;
  navigateTo: (workspace: WorkspaceId, mode?: "list" | "form", docId?: string | null) => void;
  
  // Actions
  triggerBillingDay: (dateStr?: string) => { count: number; latency: string };
  triggerRecordPayment: (invId: string, amount: number, method: string, note: string) => { success: boolean; error?: string };
  saveSubscriptionDoc: (sub: Subscription) => void;
  createSubscriptionDoc: (planId?: string) => string;
  updateSubStatus: (subId: string, status: SubscriptionStatus) => void;
  createDiscountDoc: (ruleData: Omit<DiscountRule, "id" | "current_usage_count">) => void;
  resetDatabase: () => void;
  
  // Modals & Overlays
  isAwesomeBarOpen: boolean;
  setIsAwesomeBarOpen: (open: boolean) => void;
  paymentModalOpen: boolean;
  setPaymentModalOpen: (open: boolean) => void;
  selectedPaymentInvoiceId: string | null;
  setSelectedPaymentInvoiceId: (id: string | null) => void;
  openPaymentModal: (invId?: string) => void;
  discountModalOpen: boolean;
  setDiscountModalOpen: (open: boolean) => void;
  previewInvoice: Invoice | null;
  setPreviewInvoice: (inv: Invoice | null) => void;
  
  // Toasts
  toasts: Toast[];
  addToast: (message: string, type?: "success" | "warning" | "info" | "error") => void;
  removeToast: (id: string) => void;
}

const BrightloopContext = createContext<BrightloopContextType | undefined>(undefined);

export const BrightloopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<BrightloopState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceId>("subscriptions");
  const [currentRole, setCurrentRole] = useState<Role>("Admin");
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "form">("list");

  // Modals
  const [isAwesomeBarOpen, setIsAwesomeBarOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPaymentInvoiceId, setSelectedPaymentInvoiceId] = useState<string | null>(null);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: "success" | "warning" | "info" | "error" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setState(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to local storage on state change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error("Failed to save state to localStorage:", e);
      }
    }
  }, [state, isLoaded]);

  // Global Ctrl + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsAwesomeBarOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navigateTo = useCallback((workspace: WorkspaceId, mode: "list" | "form" = "list", docId: string | null = null) => {
    setCurrentWorkspace(workspace);
    setViewMode(mode);
    setActiveDocId(docId);
  }, []);

  const triggerBillingDay = useCallback((dateStr: string = "2026-10-31") => {
    const result = runBillingDay(state, dateStr);
    setState(result.newState);
    if (result.count > 0) {
      addToast(`Billing Day Success: Generated ${result.count} invoice(s) in ${result.latency} ms!`, "success");
    } else {
      addToast("Idempotency Lock Active: 0 new invoices (all subscriptions up to date, zero double-billing).", "info");
    }
    return { count: result.count, latency: result.latency };
  }, [state, addToast]);

  const triggerRecordPayment = useCallback((invId: string, amount: number, method: string, note: string) => {
    const res = recordPayment(state, invId, amount, method, note);
    if (!res.success || !res.newState) {
      addToast(res.error || "Failed to record payment", "warning");
      return { success: false, error: res.error };
    }
    setState(res.newState);
    addToast(`Payment of $${amount.toFixed(2)} reconciled against ${invId}!`, "success");
    return { success: true };
  }, [state, addToast]);

  const saveSubscriptionDoc = useCallback((updatedSub: Subscription) => {
    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((s) => (s.id === updatedSub.id ? updatedSub : s)),
    }));
    addToast(`Subscription ${updatedSub.id} saved successfully!`, "success");
  }, [addToast]);

  const createSubscriptionDoc = useCallback((planId: string = "PLAN-PRO-ODOO") => {
    const plan = state.plans.find((p) => p.id === planId) || state.plans[0];
    const isOdoo = planId === "PLAN-PRO-ODOO";
    const subCounter = state.counters.SUB || 1;
    const newId = `SUB-2026-${String(subCounter).padStart(5, "0")}`;
    const unitPrice = 350 + (isOdoo ? 560 : 0);

    const newDoc: Subscription = {
      id: newId,
      customer_id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
      customer_name: "Brightloop Client",
      customer_address: "742 Evergreen Terrace, Springfield",
      plan_id: plan.id,
      plan_name: plan.name,
      frequency: plan.frequency,
      start_date: "2026-11-01",
      expiry_date: "2027-11-01",
      next_billing_date: "2026-11-01",
      payment_terms: "Net 15",
      status: "Quotation",
      items: [
        {
          product_id: "PROD-01",
          product_name: "Brightloop Core ERP",
          variant_name: isOdoo ? "Brand: Odoo Compatibility Layer" : "Standard Edition",
          quantity: 1,
          unit_price: unitPrice,
          subtotal: unitPrice,
        },
      ],
      subtotal: unitPrice,
      discount_amount: 0.00,
      tax_amount: Math.round(unitPrice * 0.18 * 100) / 100,
      grand_total: Math.round(unitPrice * 1.18 * 100) / 100,
      timeline: [
        {
          text: `Quotation initialized with ${plan.name}`,
          meta: "System • Just now",
        },
      ],
    };

    setState((prev) => ({
      ...prev,
      subscriptions: [newDoc, ...prev.subscriptions],
      counters: { ...prev.counters, SUB: subCounter + 1 },
    }));

    addToast(`New Document ${newId} initialized in Quotation state.`, "info");
    navigateTo("subscriptions", "form", newId);
    return newId;
  }, [state.plans, state.counters, addToast, navigateTo]);

  const updateSubStatus = useCallback((subId: string, newStatus: SubscriptionStatus) => {
    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((s) => {
        if (s.id !== subId) return s;
        return {
          ...s,
          status: newStatus,
          timeline: [
            {
              text: `Status transitioned to ${newStatus}`,
              meta: "System Manager • Just now",
            },
            ...(s.timeline || []),
          ],
        };
      }),
    }));
    addToast(`Subscription moved to ${newStatus}!`, "success");
  }, [addToast]);

  const createDiscountDoc = useCallback((ruleData: Omit<DiscountRule, "id" | "current_usage_count">) => {
    const ruleId = `DISC-${String(state.discount_rules.length + 1).padStart(2, "0")}`;
    const newRule: DiscountRule = {
      ...ruleData,
      id: ruleId,
      current_usage_count: 0,
    };
    setState((prev) => ({
      ...prev,
      discount_rules: [newRule, ...prev.discount_rules],
    }));
    addToast(`Discount Rule '${newRule.name}' created!`, "success");
  }, [state.discount_rules.length, addToast]);

  const resetDatabase = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(INITIAL_STATE);
    addToast("Database restored to clean default demo fixtures.", "success");
  }, [addToast]);

  const openPaymentModal = useCallback((invId?: string) => {
    if (invId) {
      setSelectedPaymentInvoiceId(invId);
    } else {
      const firstUnpaid = state.invoices.find((i) => i.outstanding_amount > 0);
      setSelectedPaymentInvoiceId(firstUnpaid ? firstUnpaid.id : null);
    }
    setPaymentModalOpen(true);
  }, [state.invoices]);

  return (
    <BrightloopContext.Provider
      value={{
        state,
        currentWorkspace,
        setCurrentWorkspace,
        currentRole,
        setCurrentRole,
        activeDocId,
        setActiveDocId,
        viewMode,
        setViewMode,
        navigateTo,
        triggerBillingDay,
        triggerRecordPayment,
        saveSubscriptionDoc,
        createSubscriptionDoc,
        updateSubStatus,
        createDiscountDoc,
        resetDatabase,
        isAwesomeBarOpen,
        setIsAwesomeBarOpen,
        paymentModalOpen,
        setPaymentModalOpen,
        selectedPaymentInvoiceId,
        setSelectedPaymentInvoiceId,
        openPaymentModal,
        discountModalOpen,
        setDiscountModalOpen,
        previewInvoice,
        setPreviewInvoice,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </BrightloopContext.Provider>
  );
};

export const useBrightloop = () => {
  const context = useContext(BrightloopContext);
  if (!context) {
    throw new Error("useBrightloop must be used within a BrightloopProvider");
  }
  return context;
};

