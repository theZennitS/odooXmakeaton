"use client";

import React from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fmtCurr } from "@/lib/utils";
import { Tag, Plus, Calendar, ShieldAlert } from "lucide-react";

export const DiscountRulesView: React.FC = () => {
  const { state, currentRole, setDiscountModalOpen, addToast } = useBrightloop();

  const handleCreateClick = () => {
    if (currentRole !== "Admin") {
      addToast("Permission Denied: Only System Manager (Admin) can configure Discount Rules.", "warning");
      return;
    }
    setDiscountModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* View Header with Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Admin Discount Rules
          </h1>
          <p className="text-xs text-muted-foreground">
            Set customer discount policies. Automatically evaluated and deducted during recurring billing runs.
          </p>
        </div>

        <Button
          onClick={handleCreateClick}
          variant="blue"
          className="gap-1.5 shadow-sm text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Discount Rule</span>
        </Button>
      </div>

      {currentRole !== "Admin" && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center space-x-2 text-xs text-amber-800">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            You are logged in as <strong>{currentRole}</strong> (Read-only mode). Switch to <strong>System Manager (Admin)</strong> in the top bar to create or edit discount rules.
          </span>
        </div>
      )}

      {/* Discount Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {state.discount_rules.map((rule) => (
          <div
            key={rule.id}
            className="p-5 border rounded-xl bg-card shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-400 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-sm text-foreground">{rule.name}</h3>
                <Badge variant="success" className="text-xs font-bold font-mono shrink-0">
                  {rule.discount_type === "Percentage" ? `${rule.value}% OFF` : `$${rule.value} OFF`}
                </Badge>
              </div>
              <div className="text-[11px] font-mono text-muted-foreground">
                Rule ID: {rule.id}
              </div>
            </div>

            <div className="space-y-2 text-xs border-t pt-3 text-muted-foreground">
              <div className="flex justify-between">
                <span>Scope:</span>
                <strong className="text-foreground">{rule.scope}</strong>
              </div>
              <div className="flex justify-between">
                <span>Active Window:</span>
                <span className="font-mono text-foreground">
                  {rule.start_date} to {rule.end_date}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Usage Progress:</span>
                <span className="text-foreground">
                  <strong>{rule.current_usage_count}</strong> of{" "}
                  {rule.max_usage_limit > 0 ? rule.max_usage_limit : "∞"} redemptions
                </span>
              </div>
              <div className="flex justify-between">
                <span>Min Purchase:</span>
                <span className="font-mono text-foreground">
                  {fmtCurr(rule.min_purchase_amount)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
