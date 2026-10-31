"use client";

import React from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fmtCurr } from "@/lib/utils";
import { Package, Check } from "lucide-react";

export const ProductsPlansView: React.FC = () => {
  const { state, createSubscriptionDoc } = useBrightloop();

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Subscription Plans &amp; Product Matrix
          </h1>
          <p className="text-xs text-muted-foreground">
            Tiered subscription packages, multi-period frequencies, and brand variant surcharge rates.
          </p>
        </div>

        <Button
          onClick={() => createSubscriptionDoc()}
          size="sm"
          className="text-xs"
        >
          <Package className="h-4 w-4" />
          <span>New Subscription</span>
        </Button>
      </div>

      {/* Plan Cards Grid using official shadcn Card */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Available Subscription Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {state.plans.map((plan) => {
            const isOdoo = plan.id === "PLAN-PRO-ODOO";
            return (
              <Card
                key={plan.id}
                className={`flex flex-col justify-between ${
                  isOdoo ? "border-primary" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    {isOdoo && <Badge variant="default">Featured Stack</Badge>}
                  </div>
                  <CardDescription className="pt-1">
                    <span className="text-2xl font-bold text-foreground font-mono">
                      {fmtCurr(plan.base_price)}
                    </span>{" "}
                    <span className="text-xs text-muted-foreground">
                      / {plan.frequency.toLowerCase()}
                    </span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <Separator />
                  <div className="space-y-2 text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>
                        Min Licenses:{" "}
                        <strong className="text-foreground">
                          {plan.minimum_quantity} seat(s)
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>
                        Auto-close on end:{" "}
                        <strong className="text-foreground">
                          {plan.auto_close_on_end ? "Enabled" : "Disabled"}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>
                        Customer Self-Pause:{" "}
                        <strong className="text-foreground">
                          {plan.allow_pause ? "Allowed" : "Locked"}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>
                        Early Termination:{" "}
                        <strong className="text-foreground">
                          {plan.allow_early_close
                            ? "Allowed"
                            : "Contract Bound"}
                        </strong>
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  <Button
                    variant={isOdoo ? "default" : "outline"}
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => createSubscriptionDoc(plan.id)}
                  >
                    Create Quote With Plan
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Products & Surcharge Matrix Table using official shadcn Card + Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">
            Products &amp; Brand Variant Surcharges
          </CardTitle>
          <CardDescription className="text-xs">
            Catalog items and additive variant pricing rules applied on subscription line items.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Cost Rate</TableHead>
                <TableHead className="text-right">Base Sales Rate</TableHead>
                <TableHead className="pr-6">Variant Surcharge Matrix</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="pl-6">
                    <div className="font-semibold text-xs text-foreground">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {p.notes}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal text-[11px]">
                      {p.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {fmtCurr(p.cost_price)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs text-foreground">
                    {fmtCurr(p.sales_price)}
                  </TableCell>
                  <TableCell className="pr-6">
                    {p.variants.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {p.variants.map((v, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="font-normal text-[11px] gap-1"
                          >
                            <span>{v.name}:</span>
                            <strong className="text-primary font-mono">
                              +{fmtCurr(v.price_surcharge)}
                            </strong>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-[11px] italic">
                        Standard pricing only
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
