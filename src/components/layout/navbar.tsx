"use client";

import React from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { Role } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Search, Zap, Bell, RotateCcw } from "lucide-react";

export const Navbar: React.FC = () => {
  const {
    currentWorkspace,
    currentRole,
    setCurrentRole,
    setIsAwesomeBarOpen,
    triggerBillingDay,
    navigateTo,
    addToast,
    resetDatabase,
  } = useBrightloop();

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
    }
  };

  const getAvatarInitials = () => {
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
    <TooltipProvider delayDuration={150}>
      <header className="sticky top-0 z-40 w-full h-14 border-b bg-background flex items-center justify-between px-4">
        {/* Left: Brand & Official shadcn Breadcrumb */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo("subscriptions", "list")}
            className="px-2 gap-2 font-bold text-base"
          >
            <Badge className="h-7 w-7 rounded-md p-0 flex items-center justify-center text-xs font-bold">
              B
            </Badge>
            <span className="hidden sm:inline-block tracking-tight">
              Brightloop
            </span>
          </Button>

          <Separator orientation="vertical" className="h-4 hidden sm:block" />

          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  className="cursor-pointer text-xs"
                  onClick={() => navigateTo("subscriptions", "list")}
                >
                  Desk
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs font-semibold">
                  {getWorkspaceTitle()}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Center: Awesome-bar Search Trigger (Official shadcn Button + Badge) */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <Button
            variant="outline"
            onClick={() => setIsAwesomeBarOpen(true)}
            className="w-full h-9 justify-between text-xs text-muted-foreground font-normal px-3"
          >
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Search or type a command...</span>
            </span>
            <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
              ⌘K
            </Badge>
          </Button>
        </div>

        {/* Right: Actions, Official shadcn Select Role Switcher & DropdownMenu Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => triggerBillingDay()}
                className="h-8 text-xs font-medium"
              >
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="hidden sm:inline">Run Billing Day</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Simulate daily scheduled recurring billing cron
            </TooltipContent>
          </Tooltip>

          {/* Official shadcn Select Role Switcher */}
          <div className="flex items-center gap-1.5">
            <Select
              value={currentRole}
              onValueChange={(val) => handleRoleChange(val as Role)}
            >
              <SelectTrigger className="h-8 w-[180px] text-xs">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">System Manager (Admin)</SelectItem>
                <SelectItem value="Staff">Sales &amp; Billing Staff</SelectItem>
                <SelectItem value="Customer">Customer (Brooklyn Zoe)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 relative"
                onClick={() =>
                  addToast(
                    "All services operational. Automated cron scheduler is active.",
                    "info"
                  )
                }
              >
                <Bell className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>System Notifications</TooltipContent>
          </Tooltip>

          {/* Official shadcn DropdownMenu + Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {getAvatarInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {currentRole === "Customer" ? "Brooklyn Zoe" : currentRole}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Active Session Role
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={currentRole}
                onValueChange={(val) => handleRoleChange(val as Role)}
              >
                <DropdownMenuRadioItem value="Admin">
                  System Manager (Admin)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Staff">
                  Sales &amp; Billing Staff
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Customer">
                  Customer (Brooklyn Zoe)
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => resetDatabase()}>
                <RotateCcw className="mr-2 h-4 w-4" />
                <span>Reset Demo Fixtures</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </TooltipProvider>
  );
};
