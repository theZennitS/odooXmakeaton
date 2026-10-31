"use client";

import React from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { useAuth } from "@/context/auth-context";
import { Role } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Search,
  Zap,
  Bell,
  HelpCircle,
  Shield,
  User,
  Users,
  LogOut,
} from "lucide-react";

interface NavbarProps {
  onOpenNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNotifications,
}) => {
  const {
    currentWorkspace,
    currentRole,
    setCurrentRole,
    setIsAwesomeBarOpen,
    triggerBillingDay,
    navigateTo,
    addToast,
  } = useBrightloop();

  const { user, session, setAuthModalOpen } = useAuth();

  const handleRoleChange = (newRole: Role) => {
    setCurrentRole(newRole);
    if (newRole === "Customer") {
      addToast("Switched to Customer Portal (Brooklyn Zoe — Isolated)", "info");
      navigateTo("portal");
    } else if (newRole === "Admin") {
      addToast("Role: System Manager (Full Admin Privileges)", "info");
    } else {
      addToast("Role: Sales & Billing Staff", "info");
    }
  };

  const getWorkspaceTitle = () => {
    switch (currentWorkspace) {
      case "subscriptions":
        return "Subscriptions";
      case "billing":
        return "Accounting & Invoices";
      case "products":
        return "Catalog & Pricing";
      case "discounts":
        return "Discount Rules";
      case "analytics":
        return "Executive Analytics";
      case "portal":
        return "Customer Portal";
      case "users":
        return "Team & RBAC Matrix";
      case "company":
        return "Company & Organization";
      case "health":
        return "System Health & Diagnostics";
      default:
        return "Desk";
    }
  };

  const getAvatarInitials = () => {
    if (user?.name) {
      const parts = user.name.split(" ");
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return user.name.substring(0, 2).toUpperCase();
    }
    switch (currentRole) {
      case "Admin":
        return "SM";
      case "Staff":
        return "SJ";
      case "Customer":
        return "BZ";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full h-14 border-b bg-background/95 backdrop-blur-md flex items-center justify-between px-4">
      {/* Left: Brand & Breadcrumb */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigateTo("subscriptions", "list")}
          className="flex items-center space-x-2 text-left focus:outline-none group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm group-hover:bg-blue-700 transition-colors">
            B
          </div>
          <span className="font-bold text-base tracking-tight hidden sm:inline-block">
            Brightloop
          </span>
        </button>

        <div className="h-4 w-[1px] bg-border hidden sm:block" />

        <div className="flex items-center text-xs font-medium text-muted-foreground">
          <span className="text-foreground font-semibold">{getWorkspaceTitle()}</span>
        </div>
      </div>

      {/* Center: Awesome-bar Search (Global Command Palette) */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          type="button"
          onClick={() => setIsAwesomeBarOpen(true)}
          className="w-full h-9 px-3 rounded-lg border bg-muted/40 hover:bg-muted/70 text-muted-foreground flex items-center justify-between text-xs transition-colors shadow-2xs"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Search or type a command...</span>
          </div>
          <kbd className="text-[10px] bg-background border px-1.5 py-0.5 rounded text-muted-foreground font-mono shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Role Switcher & Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Run Billing Day Cron Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => triggerBillingDay()}
          className="h-8 gap-1.5 text-xs font-medium text-blue-600 border-blue-200 bg-blue-50/50 hover:bg-blue-100 hover:text-blue-700 shadow-2xs"
          title="Simulate daily scheduled recurring billing cron"
        >
          <Zap className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
          <span className="hidden sm:inline">Run Billing Day</span>
        </Button>

        {/* 3-Tier Role Switcher for Hackathon Judges */}
        <div className="flex items-center border rounded-md px-2 py-1 bg-muted/40 text-xs">
          <span className="text-muted-foreground mr-1.5 text-[11px] font-medium hidden lg:inline">Role:</span>
          <select
            value={currentRole}
            onChange={(e) => handleRoleChange(e.target.value as Role)}
            className="bg-transparent font-medium text-xs focus:outline-none cursor-pointer"
          >
            <option value="Admin">System Manager (Admin)</option>
            <option value="Staff">Sales & Billing Staff</option>
            <option value="Customer">Customer (Brooklyn Zoe)</option>
          </select>
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          onClick={() => (onOpenNotifications ? onOpenNotifications() : addToast("All services operational. Automated cron scheduler is active.", "info"))}
          className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50 transition-colors relative"
          title="Notification Center"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full" />
        </button>

        {/* User Avatar with Auth Modal trigger */}
        <button
          type="button"
          onClick={() => setAuthModalOpen(true)}
          className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold shadow-xs select-none hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
          title={`User: ${user?.name || currentRole} (Click to manage account & sessions)`}
        >
          {getAvatarInitials()}
        </button>
      </div>
    </header>
  );
};
