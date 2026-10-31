"use client";

import React, { useState, useEffect } from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { Subscription, SubscriptionItem, SubscriptionStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { fmtCurr } from "@/lib/utils";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  Zap,
  Play,
  Pause,
  XCircle,
  CheckCircle2,
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
      <Card className="p-8 text-center">
        <CardContent className="space-y-4 pt-6">
          <p className="text-sm text-muted-foreground">
            No subscription document selected.
          </p>
          <Button
            variant="outline"
            onClick={() => navigateTo("subscriptions", "list")}
          >
            Back to Subscriptions
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleFieldChange = (field: keyof Subscription, val: unknown) => {
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
      variant_name: "Standard Edition",
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
    setFormData((prev) =>
      prev ? { ...prev, status: action as SubscriptionStatus } : null
    );
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
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTo("subscriptions", "list")}
            className="h-8 text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono tracking-tight text-foreground">
                {formData.id}
              </h1>
              {getStatusBadge(formData.status)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formData.customer_name} &bull; {formData.plan_name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Official shadcn DropdownMenu for Lifecycle State Transitions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <span>Actions</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs">
                Lifecycle Transitions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {formData.status === "Draft" && (
                <DropdownMenuItem onClick={() => handleAction("Quotation")}>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Submit Quotation</span>
                </DropdownMenuItem>
              )}
              {formData.status === "Quotation" && (
                <DropdownMenuItem onClick={() => handleAction("Confirmed")}>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Confirm Contract</span>
                </DropdownMenuItem>
              )}
              {formData.status === "Confirmed" && (
                <DropdownMenuItem onClick={() => handleAction("Active")}>
                  <Play className="h-4 w-4" />
                  <span>Activate Subscription</span>
                </DropdownMenuItem>
              )}
              {formData.status === "Active" && (
                <>
                  <DropdownMenuItem onClick={() => handleAction("BillNow")}>
                    <Zap className="h-4 w-4" />
                    <span>Bill Immediately</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAction("Paused")}>
                    <Pause className="h-4 w-4" />
                    <span>Pause Subscription</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleAction("Closed")}
                    className="text-destructive focus:text-destructive"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Cancel / Close</span>
                  </DropdownMenuItem>
                </>
              )}
              {formData.status === "Paused" && (
                <DropdownMenuItem onClick={() => handleAction("Active")}>
                  <Play className="h-4 w-4" />
                  <span>Resume Active</span>
                </DropdownMenuItem>
              )}
              {formData.status === "Closed" && (
                <DropdownMenuItem onClick={() => handleAction("Quotation")}>
                  <Play className="h-4 w-4" />
                  <span>Reopen as Quotation</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleSave} size="sm" className="h-8 text-xs">
            <Save className="h-3.5 w-3.5" />
            <span>Save</span>
          </Button>
        </div>
      </div>

      {/* Official shadcn Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="items">
            Items &amp; Add-ons ({formData.items.length})
          </TabsTrigger>
          <TabsTrigger value="billing">Recurring &amp; Taxes</TabsTrigger>
          <TabsTrigger value="timeline">
            Activity Timeline ({formData.timeline?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: DETAILS */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Subscription Overview</CardTitle>
              <CardDescription className="text-xs">
                Core customer, naming series, and plan binding information.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="doc-id">Naming Series / ID</Label>
                <Input
                  id="doc-id"
                  value={formData.id}
                  readOnly
                  className="bg-muted/40 font-mono"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cust-name">Customer Name</Label>
                <Input
                  id="cust-name"
                  value={formData.customer_name}
                  onChange={(e) =>
                    handleFieldChange("customer_name", e.target.value)
                  }
                  placeholder="e.g. John McCormick"
                />
              </div>

              <div className="grid gap-2">
                <Label>Subscription Plan</Label>
                <Select
                  value={formData.plan_id}
                  onValueChange={handlePlanChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.plans.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.frequency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cust-address">Customer Address</Label>
                <Input
                  id="cust-address"
                  value={formData.customer_address}
                  onChange={(e) =>
                    handleFieldChange("customer_address", e.target.value)
                  }
                  placeholder="Street, City, State, ZIP"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Schedule &amp; Validity</CardTitle>
              <CardDescription className="text-xs">
                Contract start date, expiration, and invoice payment terms.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    handleFieldChange("start_date", e.target.value)
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="expiry-date">Expiry Date</Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) =>
                    handleFieldChange("expiry_date", e.target.value)
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label>Payment Terms</Label>
                <Select
                  value={formData.payment_terms}
                  onValueChange={(val) =>
                    handleFieldChange("payment_terms", val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Net 15">Net 15 Days</SelectItem>
                    <SelectItem value="Immediate">Immediate</SelectItem>
                    <SelectItem value="Net 30">Net 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: ITEMS & ADD-ONS */}
        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-sm">
                  Line Items &amp; Variant Surcharges
                </CardTitle>
                <CardDescription className="text-xs">
                  Products with brand variant adjustments (e.g. Odoo Compatibility Layer adds +$560.00).
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddItemRow}
                className="h-8 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Row</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Variant Surcharge</TableHead>
                      <TableHead className="text-center w-24">Qty</TableHead>
                      <TableHead className="text-right w-28">
                        Rate ($)
                      </TableHead>
                      <TableHead className="text-right w-28">
                        Amount ($)
                      </TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.items.map((it, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-muted-foreground text-xs">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="font-medium text-xs">
                          {it.product_name}
                        </TableCell>
                        <TableCell>
                          {it.product_id === "PROD-01" ? (
                            <Select
                              value={it.variant_name || "Standard Edition"}
                              onValueChange={(val) =>
                                handleItemVariantChange(idx, val)
                              }
                            >
                              <SelectTrigger className="h-8 text-xs max-w-xs">
                                <SelectValue placeholder="Select variant" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Standard Edition">
                                  Standard Edition (+$0.00)
                                </SelectItem>
                                <SelectItem value="Brand: Odoo Compatibility Layer">
                                  Brand: Odoo Compatibility Layer (+$560.00)
                                </SelectItem>
                                <SelectItem value="Enterprise Multi-Company">
                                  Enterprise Multi-Company (+$300.00)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="outline" className="text-xs font-normal">
                              Standard
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min="1"
                            value={it.quantity}
                            onChange={(e) =>
                              handleItemQtyChange(
                                idx,
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="h-8 w-16 text-center mx-auto text-xs"
                          />
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {fmtCurr(it.unit_price)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-xs">
                          {fmtCurr(it.subtotal)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveItemRow(idx)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: RECURRING & TAXES */}
        <TabsContent value="billing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Recurring Billing Engine
                </CardTitle>
                <CardDescription className="text-xs">
                  Automated interval scheduling and next invoice generation date.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="billing-freq">Billing Frequency</Label>
                  <Input
                    id="billing-freq"
                    value={formData.frequency}
                    readOnly
                    className="bg-muted/40 font-medium"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="next-billing">
                    Next Scheduled Billing Date
                  </Label>
                  <Input
                    id="next-billing"
                    type="date"
                    value={formData.next_billing_date}
                    onChange={(e) =>
                      handleFieldChange("next_billing_date", e.target.value)
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Next cron billing date. If on or before today, clicking
                    &ldquo;Run Billing Day&rdquo; will automatically generate an
                    invoice.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Totals &amp; Tax Summary
                </CardTitle>
                <CardDescription className="text-xs">
                  Calculated net amount, active discount deductions, and 18% VAT.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium font-mono">
                    {fmtCurr(formData.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-amber-600">
                  <span>Discount Applied:</span>
                  <span className="font-mono">
                    -{fmtCurr(formData.discount_amount)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Standard VAT (18%):</span>
                  <span className="font-medium font-mono">
                    {fmtCurr(formData.tax_amount)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-bold pt-1">
                  <span>Grand Total:</span>
                  <span className="text-primary font-mono">
                    {fmtCurr(formData.grand_total)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 4: ACTIVITY TIMELINE */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Lifecycle Audit Log</CardTitle>
              <CardDescription className="text-xs">
                Immutable history of state transitions and recurring billing events.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!formData.timeline || formData.timeline.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No timeline events recorded.
                </p>
              ) : (
                formData.timeline.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <Badge className="h-2 w-2 rounded-full p-0 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">
                        {item.text}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.meta}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
