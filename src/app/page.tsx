"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { UserPortal } from "@/components/portals/user-portal";
import { CompanyPortal } from "@/components/portals/company-portal";
import { AuthModal } from "@/components/modals/auth-modal";
import { NotificationDrawer } from "@/components/layout/notification-drawer";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, User, Bell, Shield, Zap } from "lucide-react";

export default function BrightloopDeskPage() {
  const { user, setAuthModalOpen } = useAuth();
  const [portalMode, setPortalMode] = useState<"company" | "user">("company");
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
      {/* Universal Top Bar with Portal Split & Identity */}
      <header className="sticky top-0 z-40 w-full h-14 border-b bg-background/95 backdrop-blur-md flex items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            B
          </div>
          <div>
            <span className="font-bold text-base tracking-tight hidden sm:inline-block">
              Brightloop
            </span>
            <span className="text-[10px] text-muted-foreground block -mt-1 font-mono">
              v15 Frappe Core Engine
            </span>
          </div>
        </div>

        {/* Center Portal Switcher Pill */}
        <div className="flex items-center bg-muted/60 p-1 rounded-xl border text-xs font-semibold shadow-2xs">
          <button
            onClick={() => setPortalMode("company")}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              portalMode === "company"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Company Desk</span>
          </button>

          <button
            onClick={() => setPortalMode("user")}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              portalMode === "user"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>User Portal</span>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            type="button"
            onClick={() => setNotificationDrawerOpen(true)}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50 transition-colors relative"
            title="Notification Center"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full" />
          </button>

          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center space-x-2 text-xs border rounded-full px-2.5 py-1 bg-muted/30 hover:bg-muted/60 transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <span className="font-medium hidden sm:inline">{user?.name || "Account"}</span>
          </button>
        </div>
      </header>

      {/* Main Portal Viewport */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/5 overflow-y-auto">
        {portalMode === "company" ? (
          <CompanyPortal onSwitchToUser={() => setPortalMode("user")} />
        ) : (
          <UserPortal onSwitchToCompany={() => setPortalMode("company")} />
        )}
      </main>

      {/* Modals & Drawers */}
      <AuthModal />
      <NotificationDrawer
        open={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
      />
      <Toaster />
    </div>
  );
}
