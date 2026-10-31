"use client";

import React, { useState } from "react";
import { NotificationCenterItem, NotificationFilterTab } from "@/types/overall";
import { DEFAULT_NOTIFICATIONS } from "@/lib/system-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Bell, Check, Zap, Receipt, Shield, ArrowRight } from "lucide-react";

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
  onNavigate?: (workspace: any) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  open,
  onClose,
  onNavigate,
}) => {
  const [notifications, setNotifications] = useState<NotificationCenterItem[]>(DEFAULT_NOTIFICATIONS);
  const [filter, setFilter] = useState<NotificationFilterTab>("All");

  if (!open) return null;

  const filtered = notifications.filter((n) => {
    if (filter === "All") return true;
    if (filter === "Billing") return n.category === "billing";
    if (filter === "Automated Cron") return n.category === "cron";
    if (filter === "Security") return n.category === "security";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOneRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "cron":
        return <Zap className="w-3.5 h-3.5 text-amber-600" />;
      case "billing":
        return <Receipt className="w-3.5 h-3.5 text-emerald-600" />;
      case "security":
        return <Shield className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative z-50 w-full max-w-md bg-background border-l h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between bg-muted/20">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <h2 className="font-bold text-sm text-foreground">Notification Center</h2>
              {unreadCount > 0 && (
                <Badge variant="info" className="text-[10px] px-1.5 py-0 h-4">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllRead} className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground">
                  Mark all read
                </Button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b px-3 py-1.5 gap-1 bg-muted/10 overflow-x-auto text-xs">
            {(["All", "Billing", "Automated Cron", "Security"] as NotificationFilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap text-[11px] font-medium ${
                  filter === tab
                    ? "bg-background text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No notifications in this category.
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markOneRead(item.id)}
                  className={`p-3 rounded-xl border transition-all text-xs space-y-1.5 ${
                    item.read
                      ? "bg-card/50 border-border opacity-75"
                      : "bg-blue-50/30 border-blue-200/80 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(item.category)}
                      <h4 className="font-semibold text-foreground text-xs leading-tight">
                        {item.title}
                      </h4>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap font-mono">
                      {item.relativeTime}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed pl-5">
                    {item.message}
                  </p>

                  {item.actionLabel && onNavigate && (
                    <div className="pl-5 pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.actionWorkspace) {
                            onNavigate(item.actionWorkspace);
                            onClose();
                          }
                        }}
                        className="text-[11px] font-medium text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>{item.actionLabel}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-muted/20 text-center text-[10px] text-muted-foreground">
          Real-time webhook and cron activity alerts
        </div>
      </div>
    </div>
  );
};
