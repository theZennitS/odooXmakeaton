"use client";

import React, { useState } from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { Dialog, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tag, X } from "lucide-react";

export const DiscountDialog: React.FC = () => {
  const { discountModalOpen, setDiscountModalOpen, createDiscountDoc } = useBrightloop();

  const [name, setName] = useState("");
  const [type, setType] = useState<"Percentage" | "Fixed Amount">("Percentage");
  const [value, setValue] = useState<number>(15);
  const [scope, setScope] = useState<"Whole Subscription" | "Specific Products">("Whole Subscription");
  const [minPurchase, setMinPurchase] = useState<number>(0);
  const [startDate, setStartDate] = useState("2026-11-01");
  const [endDate, setEndDate] = useState("2026-12-31");
  const [usageLimit, setUsageLimit] = useState<number>(50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    createDiscountDoc({
      name,
      discount_type: type,
      value: Number(value),
      scope,
      min_purchase_amount: Number(minPurchase),
      min_quantity: 1,
      start_date: startDate,
      end_date: endDate,
      max_usage_limit: Number(usageLimit),
      applicable_product_ids: ["PROD-01"],
    });

    setDiscountModalOpen(false);
    setName("");
    setValue(15);
  };

  return (
    <Dialog open={discountModalOpen} onOpenChange={setDiscountModalOpen}>
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-blue-600" />
            <DialogTitle>New Discount Rule</DialogTitle>
          </div>
          <button
            type="button"
            onClick={() => setDiscountModalOpen(false)}
            className="text-muted-foreground hover:text-foreground rounded-full p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Rule Name <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. End of Quarter 15% Off Promo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Discount Type
              </label>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="Percentage">Percentage (%)</option>
                <option value="Fixed Amount">Fixed Amount ($)</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Discount Value <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={value}
                onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Applies To
              </label>
              <Select
                value={scope}
                onChange={(e) => setScope(e.target.value as any)}
              >
                <option value="Whole Subscription">Whole Subscription</option>
                <option value="Specific Products">Specific Products Only</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Min Purchase Amount ($)
              </label>
              <Input
                type="number"
                value={minPurchase}
                onChange={(e) => setMinPurchase(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Valid From
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Valid To
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Usage Limit
              </label>
              <Input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setDiscountModalOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" variant="blue">
            Save Discount Rule
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

