"use client";

import React, { useState } from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { useAuth } from "@/context/auth-context";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { SubscriptionListView } from "@/components/views/subscription-list-view";
import { SubscriptionFormView } from "@/components/views/subscription-form-view";
import { BillingInvoicesView } from "@/components/views/billing-invoices-view";
import { ProductsPlansView } from "@/components/views/products-plans-view";
import { DiscountRulesView } from "@/components/views/discount-rules-view";
import { AnalyticsView } from "@/components/views/analytics-view";
import { CustomerPortalView } from "@/components/views/customer-portal-view";
import { UserManagementView } from "@/components/views/user-management-view";
import { CompanyWorkspaceView } from "@/components/views/company-workspace-view";
import { SystemHealthView } from "@/components/views/system-health-view";
import { AwesomeBarModal } from "@/components/modals/awesome-bar-modal";
import { PaymentDialog } from "@/components/modals/payment-dialog";
import { DiscountDialog } from "@/components/modals/discount-dialog";
import { InvoicePreviewModal } from "@/components/modals/invoice-preview-modal";
import { AuthModal } from "@/components/modals/auth-modal";
import { NotificationDrawer } from "@/components/layout/notification-drawer";
import { Toaster } from "@/components/ui/toaster";

export default function BrightloopDeskPage() {
  const { currentWorkspace, viewMode, navigateTo } = useBrightloop();
  const { authModalOpen, setAuthModalOpen } = useAuth();
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  const renderActiveWorkspace = () => {
    switch (currentWorkspace) {
      case "subscriptions":
        return viewMode === "form" ? <SubscriptionFormView /> : <SubscriptionListView />;
      case "billing":
        return <BillingInvoicesView />;
      case "products":
        return <ProductsPlansView />;
      case "discounts":
        return <DiscountRulesView />;
      case "analytics":
        return <AnalyticsView />;
      case "portal":
        return <CustomerPortalView />;
      case "users":
        return <UserManagementView />;
      case "company":
        return <CompanyWorkspaceView />;
      case "health":
        return <SystemHealthView />;
      default:
        return <SubscriptionListView />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
      {/* Top Frappe / Brightloop Desk Header */}
      <Navbar
        onOpenNotifications={() => setNotificationDrawerOpen(true)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Workspace Navigation Sidebar */}
        <Sidebar />

        {/* Center Main Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-muted/5">
          {renderActiveWorkspace()}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <AwesomeBarModal />
      <PaymentDialog />
      <DiscountDialog />
      <InvoicePreviewModal />
      <AuthModal />
      <NotificationDrawer
        open={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        onNavigate={(ws) => navigateTo(ws)}
      />
      <Toaster />
    </div>
  );
}
