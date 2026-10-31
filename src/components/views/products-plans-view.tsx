"use client";

import React from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fmtCurr } from "@/lib/utils";
import { Package, Check, Sparkles, Layers, ShieldCheck } from "lucide-react";

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
          variant="blue"
          className="gap-1.5 shadow-sm text-xs"
        >
          <Package className="w-4 h-4" />
          <span>New Subscription</span>
        </Button>
      </div>

      {/* Plan Cards Grid */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Available Subscription Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {state.plans.map((plan) => {
            const isOdoo = plan.id === "PLAN-PRO-ODOO";
            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border p-5 flex flex-col justify-between transition-all bg-card shadow-xs ${
                  isOdoo ? "border-blue-500/50 ring-1 ring-blue-500/20" : ""
                }`}
              >
                {isOdoo && (
                  <div className="absolute -top-2.5 right-4">
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Featured Stack
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-base text-foreground">{plan.name}</h3>
                    <div className="flex items-baseline space-x-1 mt-1">
                      <span className="text-2xl font-extrabold text-blue-600">
                        {fmtCurr(plan.base_price)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / {plan.frequency.toLowerCase()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs border-t pt-3">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>
                        Min Licenses: <strong>{plan.minimum_quantity} seat(s)</strong>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>
                        Auto-close on end:{" "}
                        <strong>{plan.auto_close_on_end ? "Enabled" : "Disabled"}</strong>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>
                        Customer Self-Pause:{" "}
                        <strong>{plan.allow_pause ? "Allowed" : "Locked"}</strong>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>
                        Early Termination:{" "}
                        <strong>{plan.allow_early_close ? "Allowed" : "Contract Bound"}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t">
                  <Button
                    variant={isOdoo ? "blue" : "outline"}
                    className="w-full text-xs h-8"
                    onClick={() => createSubscriptionDoc(plan.id)}
                  >
                    Create Quote With Plan
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Products & Surcharge Matrix Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Products &amp; Brand Variant Surcharges (Matrix)
        </h2>
        <div className="border rounded-xl bg-card overflow-hidden shadow-xs">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="p-3 text-left font-semibold text-muted-foreground">Product</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Type</th>
                <th className="p-3 text-right font-semibold text-muted-foreground">Cost Rate</th>
                <th className="p-3 text-right font-semibold text-muted-foreground">Base Sales Rate</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Variant Surcharge Matrix</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {state.products.map((p) => (
                <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                  <td className="p-3">
                    <div className="font-semibold text-foreground">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground">{p.notes}</div>
                  </td>
                  <td className="p-3">
                    <Badge variant="secondary" className="font-normal text-[11px]">
                      {p.type}
                    </Badge>
                  </td>
                  <td className="p-3 text-right font-mono text-muted-foreground">
                    {fmtCurr(p.cost_price)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-foreground">
                    {fmtCurr(p.sales_price)}
                  </td>
                  <td className="p-3">
                    {p.variants.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {p.variants.map((v, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] bg-muted border text-foreground"
                          >
                            <span>{v.name}:</span>
                            <strong className="ml-1 text-blue-600 font-mono">
                              +{fmtCurr(v.price_surcharge)}
                            </strong>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-[11px] italic">
                        Standard pricing only
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
