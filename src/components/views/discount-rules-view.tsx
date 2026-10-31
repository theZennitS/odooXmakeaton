"use client";

import React from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fmtCurr } from "@/lib/utils";
import { Plus, ShieldAlert } from "lucide-react";

export const DiscountRulesView: React.FC = () => {
  const { state, currentRole, setDiscountModalOpen, addToast } =
    useBrightloop();

  const handleCreateClick = () => {
    if (currentRole !== "Admin") {
      addToast(
        "Permission Denied: Only System Manager (Admin) can configure Discount Rules.",
        "warning"
      );
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

        <Button onClick={handleCreateClick} size="sm" className="text-xs">
          <Plus className="h-4 w-4" />
          <span>New Discount Rule</span>
        </Button>
      </div>

      {currentRole !== "Admin" && (
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Read-Only Mode ({currentRole})</AlertTitle>
          <AlertDescription className="text-xs">
            Switch to <strong>System Manager (Admin)</strong> in the top navigation bar to create or modify discount rules.
          </AlertDescription>
        </Alert>
      )}

      {/* Discount Cards Grid using official shadcn Card + Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {state.discount_rules.map((rule) => {
          const usagePercent =
            rule.max_usage_limit > 0
              ? Math.min(
                  100,
                  Math.round(
                    (rule.current_usage_count / rule.max_usage_limit) * 100
                  )
                )
              : 0;

          return (
            <Card key={rule.id} className="flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm">{rule.name}</CardTitle>
                  <Badge variant="default" className="font-mono shrink-0">
                    {rule.discount_type === "Percentage"
                      ? `${rule.value}% OFF`
                      : `$${rule.value} OFF`}
                  </Badge>
                </div>
                <CardDescription className="font-mono text-[11px]">
                  Rule ID: {rule.id}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                <Separator />
                <div className="flex justify-between pt-1">
                  <span className="text-muted-foreground">Scope:</span>
                  <strong className="text-foreground">{rule.scope}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Window:</span>
                  <span className="font-mono text-foreground">
                    {rule.start_date} to {rule.end_date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min Purchase:</span>
                  <span className="font-mono text-foreground">
                    {fmtCurr(rule.min_purchase_amount)}
                  </span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Redemption Quota:
                    </span>
                    <span className="text-foreground font-mono">
                      {rule.current_usage_count} /{" "}
                      {rule.max_usage_limit > 0 ? rule.max_usage_limit : "∞"}
                    </span>
                  </div>
                  {rule.max_usage_limit > 0 && (
                    <Progress value={usagePercent} className="h-1.5" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
