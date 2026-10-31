"use client";

import React, { useState } from "react";
import { useAuth, DEMO_USERS } from "@/context/auth-context";
import { Role } from "@/types/auth";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldCheck,
  Shield,
  Lock,
  User,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Smartphone,
  Laptop,
  Globe,
  Copy,
  Check,
  LogOut,
  Sparkles,
  X,
  Fingerprint,
  Radio,
} from "lucide-react";

export const AuthModal: React.FC = () => {
  const {
    user,
    session,
    isAuthenticated,
    authModalOpen,
    setAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    login,
    register,
    logout,
    quickLogin,
    toggleMfa,
    deviceSessions,
    terminateSession,
    terminateOtherSessions,
  } = useAuth();

  // Sign In State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [isSubmittingSignIn, setIsSubmittingSignIn] = useState(false);

  // Register State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regRole, setRegRole] = useState<Role>("Staff");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState<string | null>(null);
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetDispatched, setResetDispatched] = useState(false);
  const [resetToken, setResetToken] = useState("");

  // Copy state for tokens
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);
    setIsSubmittingSignIn(true);

    try {
      const result = await login(signInEmail, signInPassword, rememberMe);
      if (result.success) {
        setSignInPassword("");
        setAuthModalOpen(false);
      } else {
        setSignInError(result.error || "Authentication failed. Check your credentials.");
      }
    } catch {
      setSignInError("An unexpected error occurred during sign in.");
    } finally {
      setIsSubmittingSignIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setIsSubmittingReg(true);

    try {
      const result = await register(regName, regEmail, regRole, regPassword);
      if (result.success) {
        setRegName("");
        setRegEmail("");
        setRegPassword("");
        setAuthModalOpen(false);
      } else {
        setRegError(result.error || "Failed to create account.");
      }
    } catch {
      setRegError("An unexpected error occurred during registration.");
    } finally {
      setIsSubmittingReg(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes("@")) return;

    const mockToken = `BL-RST-${Math.floor(100000 + Math.random() * 900000)}`;
    setResetToken(mockToken);
    setResetDispatched(true);
  };

  return (
    <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
      <DialogHeader>
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <DialogTitle>Brightloop Identity & Access Control</DialogTitle>
            <DialogDescription>
              Enterprise-grade authentication, role-based governance, and session security
            </DialogDescription>
          </div>
        </div>
        <button
          onClick={() => setAuthModalOpen(false)}
          className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>
      </DialogHeader>

      <DialogBody className="space-y-4">
        <Tabs value={authModalTab} onValueChange={setAuthModalTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="register">Create Account</TabsTrigger>
            <TabsTrigger value="forgot">Forgot Password</TabsTrigger>
            <TabsTrigger value="security">Security & Sessions</TabsTrigger>
          </TabsList>

          {/* ============================================================== */}
          {/* TAB 1: SIGN IN */}
          {/* ============================================================== */}
          <TabsContent value="signin" className="space-y-4 pt-1">
            {/* Quick 1-Click Demo Accounts Banner */}
            <div className="rounded-lg border bg-gradient-to-br from-blue-50/50 via-background to-slate-50/50 dark:from-blue-950/20 dark:to-slate-900/20 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-foreground">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>1-Click Hackathon Evaluator Quick Login</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">Instant Session Switch</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Admin Quick Login */}
                <button
                  type="button"
                  onClick={() => quickLogin("Admin")}
                  className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all ${
                    user?.role === "Admin"
                      ? "border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 shadow-xs ring-1 ring-blue-400"
                      : "bg-background hover:bg-muted/50 border-muted"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <Badge variant="purple" className="text-[10px] px-1.5 py-0">
                      System Manager
                    </Badge>
                    {user?.role === "Admin" && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-foreground">{DEMO_USERS.Admin.name}</span>
                  <span className="text-[10px] text-muted-foreground truncate w-full">
                    Full Admin Privileges
                  </span>
                </button>

                {/* Staff Quick Login */}
                <button
                  type="button"
                  onClick={() => quickLogin("Staff")}
                  className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all ${
                    user?.role === "Staff"
                      ? "border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 shadow-xs ring-1 ring-blue-400"
                      : "bg-background hover:bg-muted/50 border-muted"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <Badge variant="info" className="text-[10px] px-1.5 py-0">
                      Staff
                    </Badge>
                    {user?.role === "Staff" && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-foreground">{DEMO_USERS.Staff.name}</span>
                  <span className="text-[10px] text-muted-foreground truncate w-full">
                    Sales & Billing
                  </span>
                </button>

                {/* Customer Quick Login */}
                <button
                  type="button"
                  onClick={() => quickLogin("Customer")}
                  className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all ${
                    user?.role === "Customer"
                      ? "border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 shadow-xs ring-1 ring-blue-400"
                      : "bg-background hover:bg-muted/50 border-muted"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <Badge variant="success" className="text-[10px] px-1.5 py-0">
                      Customer
                    </Badge>
                    {user?.role === "Customer" && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-foreground">{DEMO_USERS.Customer.name}</span>
                  <span className="text-[10px] text-muted-foreground truncate w-full">
                    Customer Portal
                  </span>
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t w-full border-muted" />
              <span className="bg-background px-2 text-[11px] text-muted-foreground uppercase tracking-wider font-medium absolute">
                Or sign in with email
              </span>
            </div>

            {/* Standard Sign In Form */}
            <form onSubmit={handleSignIn} className="space-y-3">
              {signInError && (
                <div className="flex items-center space-x-2 p-2.5 rounded-md bg-destructive/10 text-destructive text-xs border border-destructive/20 animate-in fade-in-50">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{signInError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                  <Input
                    type="email"
                    placeholder="e.g. nitheesh@brightloop.io"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">Password</label>
                  <button
                    type="button"
                    onClick={() => setAuthModalTab("forgot")}
                    className="text-[11px] text-blue-600 hover:underline focus:outline-none"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                  <Input
                    type={showSignInPassword ? "text" : "password"}
                    placeholder="Enter corporate or portal password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="pl-9 pr-9 text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
                    title={showSignInPassword ? "Hide password" : "Show password"}
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 text-xs text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-input text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Remember session for 30 days</span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isSubmittingSignIn}
                className="w-full text-xs font-semibold h-9 mt-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmittingSignIn ? "Authenticating..." : "Sign In to Brightloop"}
              </Button>
            </form>

            <div className="text-center pt-2 text-xs text-muted-foreground">
              Don&apos;t have an enterprise account?{" "}
              <button
                type="button"
                onClick={() => setAuthModalTab("register")}
                className="text-blue-600 font-semibold hover:underline"
              >
                Create Account
              </button>
            </div>
          </TabsContent>

          {/* ============================================================== */}
          {/* TAB 2: CREATE ACCOUNT */}
          {/* ============================================================== */}
          <TabsContent value="register" className="space-y-3.5 pt-1">
            <div className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border">
              Provision a new user identity in the Brightloop directory. Access levels and capabilities are strictly governed by your selected role.
            </div>

            <form onSubmit={handleRegister} className="space-y-3">
              {regError && (
                <div className="flex items-center space-x-2 p-2.5 rounded-md bg-destructive/10 text-destructive text-xs border border-destructive/20 animate-in fade-in-50">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="e.g. Liam Gallagher"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                  <Input
                    type="email"
                    placeholder="e.g. liam@brightloop.io"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Assigned Role & Privilege Tier</label>
                <Select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as Role)}
                  className="text-xs"
                >
                  <option value="Admin">System Manager (Full administrative authority & cron access)</option>
                  <option value="Staff">Sales & Billing Staff (Manage subscriptions, invoices & items)</option>
                  <option value="Customer">Customer (Isolated self-service portal, view only own docs)</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Security Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                  <Input
                    type="password"
                    placeholder="At least 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="pl-9 text-xs"
                    required
                  />
                </div>
                {regPassword.length > 0 && (
                  <div className="flex items-center space-x-1 pt-1">
                    <div
                      className={`h-1 flex-1 rounded-full ${
                        regPassword.length >= 8 ? "bg-emerald-500" : regPassword.length >= 6 ? "bg-amber-500" : "bg-rose-500"
                      }`}
                    />
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {regPassword.length >= 8 ? "Strong" : regPassword.length >= 6 ? "Medium" : "Too short"}
                    </span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmittingReg}
                className="w-full text-xs font-semibold h-9 mt-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmittingReg ? "Registering identity..." : "Create Account & Sign In"}
              </Button>
            </form>

            <div className="text-center pt-1 text-xs text-muted-foreground">
              Already registered?{" "}
              <button
                type="button"
                onClick={() => setAuthModalTab("signin")}
                className="text-blue-600 font-semibold hover:underline"
              >
                Return to Sign In
              </button>
            </div>
          </TabsContent>

          {/* ============================================================== */}
          {/* TAB 3: FORGOT PASSWORD */}
          {/* ============================================================== */}
          <TabsContent value="forgot" className="space-y-4 pt-1">
            {!resetDispatched ? (
              <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                <div className="flex items-start space-x-3 p-3 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200 text-xs">
                  <KeyRound className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Zero-Trust Credential Recovery</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Provide your verified corporate or client email address to trigger a cryptographic one-time recovery token.
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Registered Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                    <Input
                      type="email"
                      placeholder="e.g. nitheesh@brightloop.io"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="pl-9 text-xs"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full text-xs font-semibold h-9 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Generate Password Reset Simulation
                </Button>

                <div className="text-center pt-1 text-xs text-muted-foreground">
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthModalTab("signin")}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 py-2 text-center animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground">Password Recovery Link Dispatched</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    A secure simulation reset ticket has been issued for{" "}
                    <span className="font-semibold text-foreground">{forgotEmail}</span>.
                  </p>
                </div>

                <div className="p-3 bg-muted rounded-lg border text-left space-y-1.5 font-mono text-xs">
                  <div className="text-[10px] text-muted-foreground uppercase font-sans font-semibold">
                    Simulated Security Ticket
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-bold">{resetToken}</span>
                    <button
                      onClick={() => handleCopy(resetToken)}
                      className="text-muted-foreground hover:text-foreground text-[11px] flex items-center space-x-1"
                    >
                      {copiedToken === resetToken ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => {
                      setResetDispatched(false);
                      setForgotEmail("");
                    }}
                  >
                    Reset Another
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setAuthModalTab("signin")}
                  >
                    Proceed to Sign In
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ============================================================== */}
          {/* TAB 4: SECURITY & SESSIONS */}
          {/* ============================================================== */}
          <TabsContent value="security" className="space-y-3.5 pt-1">
            {/* Active User Card */}
            <Card className="bg-muted/30 border-muted">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user?.avatar || "BL"}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-foreground">{user?.name || "Anonymous User"}</span>
                      <Badge
                        variant={user?.role === "Admin" ? "purple" : user?.role === "Staff" ? "info" : "success"}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {user?.role === "Admin" ? "System Manager" : user?.role}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground">{user?.email}</div>
                  </div>
                </div>

                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      logout();
                      setAuthModalTab("signin");
                    }}
                    className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1"
                    title="Log out of current session"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* MFA / 2FA Badge & Toggle Card */}
            <div className="p-3 rounded-lg border bg-background flex items-center justify-between shadow-2xs">
              <div className="flex items-center space-x-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    user?.mfaEnabled
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950/40"
                  }`}
                >
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-foreground">Multi-Factor Authentication (2FA)</span>
                    <Badge variant={user?.mfaEnabled ? "success" : "warning"} className="text-[10px] px-1.5 py-0">
                      {user?.mfaEnabled ? "Enforced & Active" : "Unprotected"}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    TOTP Authenticator & FIDO2 WebAuthn hardware token enforcement
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMfa}
                className="h-7 text-[11px] shrink-0"
              >
                {user?.mfaEnabled ? "Disable 2FA" : "Enable 2FA"}
              </Button>
            </div>

            {/* Active Session Token & Metadata Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center space-x-1.5">
                  <Laptop className="w-3.5 h-3.5 text-blue-600" />
                  <span>Current Active Session</span>
                </span>
                <span className="flex items-center space-x-1 text-[11px] text-emerald-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Authorized</span>
                </span>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-[11px]">Session Token:</span>
                  <div className="flex items-center space-x-1.5 font-mono text-[11px] bg-background px-2 py-0.5 rounded border">
                    <span className="truncate max-w-[170px]">{session?.token || "No active token"}</span>
                    {session?.token && (
                      <button
                        onClick={() => handleCopy(session.token)}
                        className="text-muted-foreground hover:text-foreground"
                        title="Copy session token"
                      >
                        {copiedToken === session.token ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Client IP Address:</span>
                  <span className="font-mono text-foreground">{session?.ipAddress || "192.168.1.142"}</span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Geographic Location:</span>
                  <span className="text-foreground">{session?.location || "Bangalore, India"}</span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Session Expiration:</span>
                  <span className="font-mono text-muted-foreground">
                    {session?.expiresAt ? new Date(session.expiresAt).toLocaleDateString() : "7 days remaining"}
                  </span>
                </div>
              </div>
            </div>

            {/* Other Connected Devices */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Registered Device Sessions</span>
                </span>
                {deviceSessions.length > 1 && (
                  <button
                    type="button"
                    onClick={terminateOtherSessions}
                    className="text-[11px] text-rose-600 hover:underline font-medium"
                  >
                    Terminate Other Devices
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {deviceSessions.map((ds) => (
                  <div
                    key={ds.id}
                    className="flex items-center justify-between p-2 rounded-md border bg-background text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      {ds.device.includes("iPhone") ? (
                        <Smartphone className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : (
                        <Laptop className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-medium text-foreground text-[11px]">{ds.device}</span>
                          {ds.isCurrent && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 border-blue-400 text-blue-600">
                              This Device
                            </Badge>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {ds.ipAddress} • {ds.location} • {ds.lastActive}
                        </div>
                      </div>
                    </div>

                    {!ds.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => terminateSession(ds.id)}
                        className="h-6 text-[10px] text-muted-foreground hover:text-rose-600 px-2"
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogBody>

      <DialogFooter>
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <div className="flex items-center space-x-1.5">
            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span>Zero-Trust Directory Synced</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAuthModalOpen(false)}
            className="text-xs h-8"
          >
            Close
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
};
