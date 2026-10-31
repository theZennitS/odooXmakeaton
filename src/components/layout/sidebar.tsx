"use client";

import React from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { WorkspaceId } from "@/types";
import {
  Layers,
  Receipt,
  Package,
  Tag,
  BarChart3,
  UserCheck,
  CheckCircle,
  Users,
  Building2,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: WorkspaceId;
  label: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC = () => {
  const { currentWorkspace, navigateTo, currentRole } = useBrightloop();

  const mainWorkspaces: NavItem[] = [
    {
      id: "subscriptions",
      label: "Subscriptions",
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: "billing",
      label: "Billing & Invoices",
      icon: <Receipt className="w-4 h-4" />,
    },
    {
      id: "products",
      label: "Products & Plans",
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: "discounts",
      label: "Discount Rules",
      icon: <Tag className="w-4 h-4" />,
    },
    {
      id: "analytics",
      label: "Finance Analytics",
      icon: <BarChart3 className="w-4 h-4" />,
    },
  ];

  const administrationWorkspaces: NavItem[] = [
    {
      id: "users",
      label: "Team & RBAC",
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: "company",
      label: "Company Profile",
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: "health",
      label: "System Health",
      icon: <Activity className="w-4 h-4" />,
    },
  ];

  const portalWorkspaces: NavItem[] = [
    {
      id: "portal",
      label: "Customer Portal",
      icon: <UserCheck className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-60 border-r bg-muted/20 flex flex-col justify-between shrink-0 h-[calc(100vh-3.5rem)] sticky top-14 select-none">
      <div className="p-3 space-y-5 overflow-y-auto">
        {/* Main Workspaces */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Workspaces
          </div>
          <div className="space-y-1">
            {mainWorkspaces.map((item) => {
              const isActive = currentWorkspace === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id, "list")}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left",
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span className={cn(isActive ? "text-white" : "text-muted-foreground")}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Administration & Setup */}
        {currentRole !== "Customer" && (
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Administration
            </div>
            <div className="space-y-1">
              {administrationWorkspaces.map((item) => {
                const isActive = currentWorkspace === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id, "list")}
                    className={cn(
                      "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left",
                      isActive
                        ? "bg-blue-600 text-white font-semibold shadow-xs"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span className={cn(isActive ? "text-white" : "text-muted-foreground")}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Portal & Tools */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Portal &amp; Tools
          </div>
          <div className="space-y-1">
            {portalWorkspaces.map((item) => {
              const isActive = currentWorkspace === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id, "list")}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left",
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span className={cn(isActive ? "text-white" : "text-muted-foreground")}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* System Engine Footer Badge */}
      <div className="p-3 border-t bg-muted/40 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-foreground">Frappe v15 Engine</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
            <CheckCircle className="w-2.5 h-2.5" /> &lt; 2s SLA Pass
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-tight">
          Strict Idempotency Guard &amp; Zero Double-Billing Enforced.
        </p>
      </div>
    </aside>
  );
};
