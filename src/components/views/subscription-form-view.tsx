"use client";

import React, { useState, useEffect } from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { Subscription, SubscriptionItem, SubscriptionStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { fmtCurr } from "@/lib/utils";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
} from "lucide-react";

export const SubscriptionFormView: React.FC = () => {
  const {
    activeDocId,
    state,
    navigateTo,
    saveSubscriptionDoc,
    updateSubStatus,
    triggerBillingDay,
    addToast,
  } = useBrightloop();

  const originalSub = state.subscriptions.find((s) => s.id === activeDocId);

  const [formData, setFormData] = useState<Subscription | null>(null);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (originalSub) {
      setFormData(JSON.parse(JSON.stringify(originalSub)));
    }
  }, [originalSub]);

  if (!formData) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No subscription document selected.</p>
        <Button
          variant="outline"
          onClick={() => navigateTo("subscriptions", "list")}
          className="mt-4"
        >
          Back to Subscriptions
        </Button>
      </div>
    );
  }

  const handleFieldChange = (field: keyof Subscription, val: any) => {
    setFormData((prev) => (prev ? { ...prev, [field]: val } : null));
  };

  const handlePlanChange = (planId: string) => {
    const selectedPlan = state.plans.find((p) => p.id === planId);
    if (!selectedPlan) return;

    setFormData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        plan_id: selectedPlan.id,
        plan_name: selectedPlan.name,
        frequency: selectedPlan.frequency,
      };
    });
  };

  const handleItemVariantChange = (index: number, variantName: string) => {
    if (!formData) return;
    const items = [...formData.items];
    const item = { ...items[index] };
    item.variant_name = variantName;

    let surcharge = 0;
    if (variantName.includes("Odoo")) surcharge = 560;
    if (variantName.includes("Multi")) surcharge = 300;

    item.unit_price = 350 + surcharge;
    item.subtotal = item.unit_price * item.quantity;
    items[index] = item;

    recalculateAndSetItems(items);
  };

  const handleItemQtyChange = (index: number, qty: number) => {
    if (!formData) return;
    const items = [...formData.items];
    const item = { ...items[index] };
    item.quantity = Math.max(1, qty);
    item.subtotal = item.unit_price * item.quantity;
    items[index] = item;

    recalculateAndSetItems(items);
  };

  const handleAddItemRow = () => {
    if (!formData) return;
    const newItem: SubscriptionItem = {
      product_id: "PROD-02",
      product_name: "Advanced Analytics & BI Add-on",
      variant_name: "",
      quantity: 1,
      unit_price: 120.0,
      subtotal: 120.0,
    };
    const items = [...formData.items, newItem];
    recalculateAndSetItems(items);
  };

  const handleRemoveItemRow = (index: number) => {
    if (!formData) return;
    if (formData.items.length <= 1) {
      addToast("Subscription must have at least one line item.", "warning");
      return;
    }
    const items = formData.items.filter((_, idx) => idx !== index);
    recalculateAndSetItems(items);
  };

  const recalculateAndSetItems = (items: SubscriptionItem[]) => {
    const subtotal = items.reduce((sum, it) => sum + it.subtotal, 0);
    const discount = formData ? formData.discount_amount : 0;
    const taxable = Math.max(0, subtotal - discount);
    const tax = Math.round(taxable * 0.18 * 100) / 100;
    const grand = Math.round((taxable + tax) * 100) / 100;

    setFormData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items,
        subtotal,
        tax_amount: tax,
        grand_total: grand,
      };
    });
  };

  const handleSave = () => {
    if (!formData) return;
    saveSubscriptionDoc(formData);
  };

  const handleAction = (action: string) => {
    if (!formData) return;
    if (action === "BillNow") {
      triggerBillingDay(formData.next_billing_date);
      return;
    }
    updateSubStatus(formData.id, action as SubscriptionStatus);
    setFormData((prev) => (prev ? { ...prev, status: action as SubscriptionStatus } : null));
  };

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
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTo("subscriptions", "list")}
            className="gap-1 h-8 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </Button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold font-mono tracking-tight text-foreground">
                {formData.id}
              </h1>
              {getStatusBadge(formData.status)}
            </div>
            <p className="text-xs text-muted-foreground">{formData.customer_name} &bull; {formData.plan_name}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Action State Transition Dropdown */}
          <Select
            value=""
            onChange={(e) => {
              if (e.target.value) handleAction(e.target.value);
            }}
            className="h-8 text-xs w-36 bg-background"
          >
            <option value="">Actions ▾</option>
            {formData.status === "Draft" && <option value="Quotation">Submit Quotation</option>}
            {formData.status === "Quotation" && <option value="Confirmed">Confirm Contract</option>}
            {formData.status === "Confirmed" && <option value="Active">Activate Subscription</option>}
            {formData.status === "Active" && (
              <>
                <option value="Paused">Pause Subscription</option>
                <option value="Closed">Cancel / Close</option>
                <option value="BillNow">Bill Immediately</option>
              </>
            )}
            {formData.status === "Paused" && <option value="Active">Resume Active</option>}
          </Select>

          <Button onClick={handleSave} variant="blue" size="sm" className="h-8 gap-1 text-xs">
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/60">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="items">Items &amp; Add-ons ({formData.items.length})</TabsTrigger>
          <TabsTrigger value="billing">Recurring &amp; Taxes</TabsTrigger>
          <TabsTrigger value="timeline">Activity Timeline ({formData.timeline?.length || 0})</TabsTrigger>
        </TabsList>

        {/* TAB 1: DETAILS */}
        <TabsContent value="details" className="space-y-6">
          <div className="p-5 border rounded-xl bg-card space-y-4 shadow-2xs">
            <h3 className="font-semibold text-sm border-b pb-2 text-foreground">Subscription Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                  Naming Series / ID
                </label>
                <Input value={formData.id} readOnly className="bg-muted/40 font-mono" />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                  Customer Name <span className="text-destructive">*</span>
                </label>
                <Input
                  value={formData.customer_name}
                  onChange={(e) => handleFieldChange("customer_name", e.target.value)}
                  placeholder="e.g. John McCormick"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                  Subscription Plan <span className="text-destructive">*</span>
                </label>
                <Select
                  value={formData.plan_id}
                  onChange={(e) => handlePlanChange(e.target.value)}
                >
                  {state.plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.frequency})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                  Customer Address
                </label>
                <Input
                  value={formData.customer_address}
                  onChange={(e) => handleFieldChange("customer_address", e.target.value)}
                  placeholder="Street, City, State, ZIP"
                />
              </div>
            </div>
          </div>

          <div className="p-5 border rounded-xl bg-card space-y-4 shadow-2xs">
            <h3 className="font-semibold text-sm border-b pb-2 text-foreground">Schedule &amp; Validity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                  Start Date <span className="text-destructive">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleFieldChange("start_date", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                  Expiry Date
                </label>
                <Input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => handleFieldChange("expiry_date", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                  Payment Terms
                </label>
                <Select
                  value={formData.payment_terms}
                  onChange={(e) => handleFieldChange("payment_terms", e.target.value)}
                >
                  <option value="Net 15">Net 15 Days</option>
                  <option value="Immediate">Immediate</option>
                  <option value="Net 30">Net 30 Days</option>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: ITEMS & ADD-ONS (Child Table) */}
        <TabsContent value="items" className="space-y-4">
          <div className="p-5 border rounded-xl bg-card space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-semibold text-sm text-foreground">Line Items &amp; Variant Surcharges</h3>
                <p className="text-xs text-muted-foreground">
                  Products with brand variant adjustments (e.g. Odoo Compatibility Layer adds +$560.00).
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddItemRow}
                className="gap-1 h-8 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 border-b">
                  <tr>
                    <th className="p-2.5 text-left font-semibold text-muted-foreground w-8">#</th>
                    <th className="p-2.5 text-left font-semibold text-muted-foreground">Product</th>
                    <th className="p-2.5 text-left font-semibold text-muted-foreground">Variant Surcharge</th>
                    <th className="p-2.5 text-center font-semibold text-muted-foreground w-20">Qty</th>
                    <th className="p-2.5 text-right font-semibold text-muted-foreground w-28">Rate ($)</th>
                    <th className="p-2.5 text-right font-semibold text-muted-foreground w-28">Amount ($)</th>
                    <th className="p-2.5 text-center font-semibold text-muted-foreground w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {formData.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      <td className="p-2.5 text-muted-foreground">{idx + 1}</td>
                      <td className="p-2.5 font-medium">{it.product_name}</td>
                      <td className="p-2.5">
                        {it.product_id === "PROD-01" ? (
                          <Select
                            value={it.variant_name}
                            onChange={(e) => handleItemVariantChange(idx, e.target.value)}
                            className="h-8 text-xs max-w-xs"
                          >
                            <option value="Standard Edition">Standard Edition (+$0.00)</option>
                            <option value="Brand: Odoo Compatibility Layer">
                              Brand: Odoo Compatibility Layer (+$560.00)
                            </option>
                            <option value="Enterprise Multi-Company">
                              Enterprise Multi-Company (+$300.00)
                            </option>
                          </Select>
                        ) : (
                          <span className="text-muted-foreground italic">Standard</span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        <Input
                          type="number"
                          min="1"
                          value={it.quantity}
                          onChange={(e) => handleItemQtyChange(idx, parseInt(e.target.value) || 1)}
                          className="h-8 w-16 text-center mx-auto"
                        />
                      </td>
                      <td className="p-2.5 text-right font-mono">{fmtCurr(it.unit_price)}</td>
                      <td className="p-2.5 text-right font-mono font-semibold">{fmtCurr(it.subtotal)}</td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => handleRemoveItemRow(idx)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: RECURRING & TAXES */}
        <TabsContent value="billing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 border rounded-xl bg-card space-y-4 shadow-2xs">
              <h3 className="font-semibold text-sm border-b pb-2 text-foreground">Recurring Billing Engine</h3>
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                    Billing Frequency
                  </label>
                  <Input value={formData.frequency} readOnly className="bg-muted/40 font-medium" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                    Next Scheduled Billing Date
                  </label>
                  <Input
                    type="date"
                    value={formData.next_billing_date}
                    onChange={(e) => handleFieldChange("next_billing_date", e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Next cron billing date. If on or before today, clicking &ldquo;Run Billing Day&rdquo; will automatically generate an invoice.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 border rounded-xl bg-card space-y-4 shadow-2xs">
              <h3 className="font-semibold text-sm border-b pb-2 text-foreground">Totals &amp; Tax Summary</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium font-mono">{fmtCurr(formData.subtotal)}</span>
                </div>
                <div className="flex justify-between text-amber-600">
                  <span>Discount Applied:</span>
                  <span className="font-mono">-{fmtCurr(formData.discount_amount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Standard VAT (18%):</span>
                  <span className="font-medium font-mono">{fmtCurr(formData.tax_amount)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t pt-2 border-foreground/10">
                  <span>Grand Total:</span>
                  <span className="text-blue-600 font-mono">{fmtCurr(formData.grand_total)}</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 4: ACTIVITY TIMELINE */}
        <TabsContent value="timeline">
          <div className="p-5 border rounded-xl bg-card space-y-4 shadow-2xs">
            <h3 className="font-semibold text-sm border-b pb-2 text-foreground">Lifecycle Audit Log</h3>
            <div className="space-y-4">
              {(!formData.timeline || formData.timeline.length === 0) ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No timeline events recorded.</p>
              ) : (
                formData.timeline.map((item, idx) => (
                  <div key={idx} className="flex space-x-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">{item.text}</p>
                      <p className="text-[11px] text-muted-foreground">{item.meta}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

