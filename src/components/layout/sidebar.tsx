"use client";

import React from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { WorkspaceId } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Layers,
  Receipt,
  Package,
  Tag,
  BarChart3,
  UserCheck,
  CheckCircle,
} from "lucide-react";

interface NavItem {
  id: WorkspaceId;
  label: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC = () => {
  const { currentWorkspace, navigateTo } = useBrightloop();

  const mainWorkspaces: NavItem[] = [
    {
      id: "subscriptions",
      label: "Subscriptions",
      icon: <Layers className="h-4 w-4" />,
    },
    {
      id: "billing",
      label: "Billing & Invoices",
      icon: <Receipt className="h-4 w-4" />,
    },
    {
      id: "products",
      label: "Products & Plans",
      icon: <Package className="h-4 w-4" />,
    },
    {
      id: "discounts",
      label: "Discount Rules",
      icon: <Tag className="h-4 w-4" />,
    },
    {
      id: "analytics",
      label: "Finance Analytics",
      icon: <BarChart3 className="h-4 w-4" />,
    },
  ];

  const portalWorkspaces: NavItem[] = [
    {
      id: "portal",
      label: "Customer Portal",
      icon: <UserCheck className="h-4 w-4" />,
    },
  ];

  return (
    <aside className="w-60 border-r bg-muted/20 flex flex-col justify-between shrink-0 h-[calc(100vh-3.5rem)] sticky top-14 select-none">
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {/* Main Workspaces */}
          <div className="space-y-1">
            <h4 className="px-3 pb-1 text-xs font-semibold text-muted-foreground tracking-tight">
              Workspaces
            </h4>
            {mainWorkspaces.map((item) => {
              const isActive = currentWorkspace === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigateTo(item.id, "list")}
                  className="w-full justify-start gap-2.5 text-xs font-medium"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>

          <Separator />

          {/* Portal & Tools */}
          <div className="space-y-1">
            <h4 className="px-3 pb-1 text-xs font-semibold text-muted-foreground tracking-tight">
              Portal &amp; Tools
            </h4>
            {portalWorkspaces.map((item) => {
              const isActive = currentWorkspace === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigateTo(item.id, "list")}
                  className="w-full justify-start gap-2.5 text-xs font-medium"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      {/* System Engine Footer Card */}
      <div className="p-3 border-t">
        <Card className="bg-background shadow-none">
          <CardContent className="p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Frappe v15 Engine
              </span>
              <Badge variant="secondary" className="text-[10px] gap-1 px-1.5 py-0">
                <CheckCircle className="h-2.5 w-2.5 text-emerald-600" />
                &lt; 2s SLA
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Strict Idempotency Guard &amp; Zero Double-Billing Enforced.
            </p>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
};
