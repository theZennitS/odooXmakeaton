"use client";

import React, { useState } from "react";
import { useBrightloop } from "@/context/brightloop-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const DiscountDialog: React.FC = () => {
  const { discountModalOpen, setDiscountModalOpen, createDiscountDoc } =
    useBrightloop();

  const [name, setName] = useState("");
  const [type, setType] = useState<"Percentage" | "Fixed Amount">("Percentage");
  const [value, setValue] = useState<number>(15);
  const [scope, setScope] = useState<"Whole Subscription" | "Specific Products">(
    "Whole Subscription"
  );
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
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>New Discount Rule</DialogTitle>
            <DialogDescription>
              Configure an automated customer discount policy evaluated during recurring billing runs.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="rule-name">Rule Name</Label>
              <Input
                id="rule-name"
                type="text"
                placeholder="e.g. End of Quarter 15% Off Promo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Discount Type</Label>
                <Select
                  value={type}
                  onValueChange={(val) =>
                    setType(val as "Percentage" | "Fixed Amount")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Percentage">Percentage (%)</SelectItem>
                    <SelectItem value="Fixed Amount">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="discount-value">Discount Value</Label>
                <Input
                  id="discount-value"
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
              <div className="grid gap-2">
                <Label>Applies To</Label>
                <Select
                  value={scope}
                  onValueChange={(val) =>
                    setScope(val as "Whole Subscription" | "Specific Products")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Whole Subscription">
                      Whole Subscription
                    </SelectItem>
                    <SelectItem value="Specific Products">
                      Specific Products Only
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="min-purchase">Min Purchase Amount ($)</Label>
                <Input
                  id="min-purchase"
                  type="number"
                  value={minPurchase}
                  onChange={(e) =>
                    setMinPurchase(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="valid-from">Valid From</Label>
                <Input
                  id="valid-from"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="valid-to">Valid To</Label>
                <Input
                  id="valid-to"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="usage-limit">Usage Limit</Label>
                <Input
                  id="usage-limit"
                  type="number"
                  value={usageLimit}
                  onChange={(e) =>
                    setUsageLimit(parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDiscountModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Discount Rule</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
