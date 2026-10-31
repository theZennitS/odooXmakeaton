"use client";

import React, { useState } from "react";
import { useBrightloop } from "@/context/brightloop-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  UserProfile,
  UserRole,
  DocType,
  DocPermAction,
  DocPermissionMatrix,
  DocPermissionRule,
  UserActivityLogEntry,
} from "@/types/user";
import {
  SEED_USERS,
  DEFAULT_DOC_PERMISSION_MATRIX,
  SEED_ACTIVITY_LOG,
  ALL_DOC_TYPES,
  ALL_ROLES,
} from "@/lib/user-data";
import {
  Users,
  UserPlus,
  ShieldCheck,
  History,
  Search,
  Check,
  X,
  Lock,
  Unlock,
  Trash2,
  RefreshCw,
  Save,
  Clock,
  Shield,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Building2,
  UserCheck,
  UserX,
} from "lucide-react";

export const UserManagementView: React.FC = () => {
  const { addToast } = useBrightloop();

  // State
  const [activeTab, setActiveTab] = useState<string>("team");
  const [users, setUsers] = useState<UserProfile[]>(SEED_USERS);
  const [docPerms, setDocPerms] = useState<DocPermissionMatrix>(
    DEFAULT_DOC_PERMISSION_MATRIX
  );
  const [hasUnsavedPerms, setHasUnsavedPerms] = useState<boolean>(false);
  const [activityLogs, setActivityLogs] =
    useState<UserActivityLogEntry[]>(SEED_ACTIVITY_LOG);

  // Filter & Search states
  const [userSearch, setUserSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [permRoleFilter, setPermRoleFilter] = useState<string>("all");
  const [permDocTypeFilter, setPermDocTypeFilter] = useState<string>("all");

  const [logSearch, setLogSearch] = useState<string>("");

  // Invite User Dialog state
  const [inviteDialogOpen, setInviteDialogOpen] = useState<boolean>(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "Staff" as UserRole,
    department: "",
    phone: "",
  });
  const [inviteError, setInviteError] = useState<string>("");

  // Helpers for Avatar styling
  const getAvatarBg = (name: string, role: UserRole) => {
    if (role === "Admin") return "bg-purple-600 text-white";
    if (role === "Staff") return "bg-blue-600 text-white";
    return "bg-amber-600 text-white";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // User Actions
  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === "Active" ? "Suspended" : "Active";
          // Add activity log
          const newLog: UserActivityLogEntry = {
            id: `LOG-${Date.now()}`,
            user_id: "USR-001",
            user_name: "System Manager",
            user_email: "admin@brightloop.io",
            role: "Admin",
            action: `User ${newStatus === "Active" ? "Activated" : "Suspended"}`,
            details: `Status of ${u.name} (${u.email}) was updated to ${newStatus}.`,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            ip_address: "192.168.1.10",
            status: newStatus === "Active" ? "Success" : "Warning",
          };
          setActivityLogs((logs) => [newLog, ...logs]);
          addToast(
            `User "${u.name}" has been ${newStatus.toLowerCase()}.`,
            newStatus === "Active" ? "success" : "warning"
          );
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find((u) => u.id === userId);
    if (!userToDelete) return;

    if (userToDelete.role === "Admin" && users.filter((u) => u.role === "Admin").length <= 1) {
      addToast("Cannot remove the primary System Manager Admin.", "error");
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));

    const newLog: UserActivityLogEntry = {
      id: `LOG-${Date.now()}`,
      user_id: "USR-001",
      user_name: "System Manager",
      user_email: "admin@brightloop.io",
      role: "Admin",
      action: "User Removed",
      details: `User account ${userToDelete.name} (${userToDelete.email}) was removed from workspace.`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      ip_address: "192.168.1.10",
      status: "Warning",
    };
    setActivityLogs((logs) => [newLog, ...logs]);
    addToast(`User ${userToDelete.name} removed.`, "info");
  };

  // Invite User Submit
  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");

    if (!inviteForm.name.trim()) {
      setInviteError("Name is required.");
      return;
    }
    if (!inviteForm.email.trim() || !inviteForm.email.includes("@")) {
      setInviteError("A valid work email is required.");
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === inviteForm.email.toLowerCase())) {
      setInviteError("A user with this email address already exists.");
      return;
    }

    const nextIdNum = users.length + 1;
    const newId = `USR-${String(nextIdNum).padStart(3, "0")}`;

    const newUser: UserProfile = {
      id: newId,
      name: inviteForm.name.trim(),
      email: inviteForm.email.trim(),
      role: inviteForm.role,
      department: inviteForm.department.trim() || "Operations",
      status: "Active",
      last_login: "Never (Pending Invite)",
      phone: inviteForm.phone.trim() || "N/A",
      created_at: new Date().toISOString().split("T")[0],
    };

    setUsers((prev) => [...prev, newUser]);

    // Record in activity log
    const newLog: UserActivityLogEntry = {
      id: `LOG-${Date.now()}`,
      user_id: "USR-001",
      user_name: "System Manager",
      user_email: "admin@brightloop.io",
      role: "Admin",
      action: "User Invited",
      details: `Sent invitation to ${newUser.name} as ${newUser.role} in ${newUser.department}.`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      ip_address: "192.168.1.10",
      status: "Success",
    };
    setActivityLogs((logs) => [newLog, ...logs]);

    addToast(`Invitation sent to ${newUser.email}!`, "success");

    // Reset form and close
    setInviteForm({
      name: "",
      email: "",
      role: "Staff",
      department: "",
      phone: "",
    });
    setInviteDialogOpen(false);
  };

  // DocPerm Toggle Action
  const handleToggleDocPerm = (
    docType: string,
    role: UserRole,
    action: DocPermAction
  ) => {
    setDocPerms((prev) =>
      prev.map((rule) => {
        if (rule.doc_type === docType && rule.role === role) {
          return {
            ...rule,
            [action]: !rule[action],
          };
        }
        return rule;
      })
    );
    setHasUnsavedPerms(true);
  };

  const handleSaveDocPerms = () => {
    setHasUnsavedPerms(false);
    const newLog: UserActivityLogEntry = {
      id: `LOG-${Date.now()}`,
      user_id: "USR-001",
      user_name: "System Manager",
      user_email: "admin@brightloop.io",
      role: "Admin",
      action: "DocPerm Matrix Update",
      details: "Updated DocType permission rules matrix across roles.",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      ip_address: "192.168.1.10",
      status: "Success",
    };
    setActivityLogs((logs) => [newLog, ...logs]);
    addToast("DocPermission Matrix saved successfully.", "success");
  };

  const handleResetDocPerms = () => {
    setDocPerms(DEFAULT_DOC_PERMISSION_MATRIX);
    setHasUnsavedPerms(false);
    addToast("DocPermission Matrix reset to system defaults.", "info");
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.department.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Filtered DocPerm Rules
  const filteredDocPerms = docPerms.filter((rule) => {
    const matchesRole = permRoleFilter === "all" || rule.role === permRoleFilter;
    const matchesDocType =
      permDocTypeFilter === "all" || rule.doc_type === permDocTypeFilter;
    return matchesRole && matchesDocType;
  });

  // Filtered Activity Logs
  const filteredLogs = activityLogs.filter((log) => {
    return (
      log.user_name.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase()) ||
      (log.doc_id && log.doc_id.toLowerCase().includes(logSearch.toLowerCase()))
    );
  });

  // Metrics
  const activeAdminsAndStaff = users.filter(
    (u) => (u.role === "Admin" || u.role === "Staff") && u.status === "Active"
  ).length;
  const customerCount = users.filter((u) => u.role === "Customer").length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            <span>Desk</span>
            <span>/</span>
            <span>Security & Administration</span>
            <span>/</span>
            <span className="text-foreground">Users & RBAC</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            User Management & Role Permissions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Frappe-style Role-Based Access Control (RBAC), DocPerm matrix enforcement, and team provisioning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setInviteDialogOpen(true)}
            className="gap-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            + Invite User
          </Button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs border-muted/60">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium">Total Registered Users</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center justify-between">
              <span>{users.length}</span>
              <Users className="w-5 h-5 text-muted-foreground opacity-60" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            {users.filter((u) => u.status === "Active").length} active accounts
          </CardContent>
        </Card>

        <Card className="shadow-xs border-muted/60">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium">Internal Staff & Admins</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center justify-between text-blue-600">
              <span>{activeAdminsAndStaff}</span>
              <ShieldCheck className="w-5 h-5 text-blue-500 opacity-60" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            Operational billing & desk users
          </CardContent>
        </Card>

        <Card className="shadow-xs border-muted/60">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium">Customer Portal Accounts</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center justify-between text-amber-600">
              <span>{customerCount}</span>
              <UserCheck className="w-5 h-5 text-amber-500 opacity-60" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            Self-service subscription subscribers
          </CardContent>
        </Card>

        <Card className="shadow-xs border-muted/60">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium">DocPerm Rules Enforced</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center justify-between text-emerald-600">
              <span>{docPerms.length}</span>
              <FileCheck2 className="w-5 h-5 text-emerald-500 opacity-60" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            Across 5 Core DocTypes & 3 Roles
          </CardContent>
        </Card>
      </div>

      {/* Main Workspace Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-2">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="team" className="gap-2">
              <Users className="w-4 h-4" />
              Team Members ({users.length})
            </TabsTrigger>
            <TabsTrigger value="permissions" className="gap-2">
              <ShieldCheck className="w-4 h-4" />
              DocPerm Matrix
              {hasUnsavedPerms && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <History className="w-4 h-4" />
              Security Audit Log
            </TabsTrigger>
          </TabsList>

          {activeTab === "permissions" && hasUnsavedPerms && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-amber-600 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Unsaved Permission Changes
              </span>
              <Button size="sm" onClick={handleSaveDocPerms} className="h-7 text-xs gap-1">
                <Save className="w-3 h-3" /> Save Matrix
              </Button>
            </div>
          )}
        </div>

        {/* TAB 1: TEAM MEMBERS TABLE */}
        <TabsContent value="team" className="space-y-4 pt-2">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-lg border shadow-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search member, email, department..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-32 h-9 text-xs"
              >
                <option value="all">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
                <option value="Customer">Customer</option>
              </Select>

              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-32 h-9 text-xs"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </Select>
            </div>
          </div>

          {/* Members Table */}
          <div className="rounded-lg border bg-card shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold text-xs">Member</TableHead>
                  <TableHead className="font-semibold text-xs">Role</TableHead>
                  <TableHead className="font-semibold text-xs">Department / Scope</TableHead>
                  <TableHead className="font-semibold text-xs">Status</TableHead>
                  <TableHead className="font-semibold text-xs">Last Login</TableHead>
                  <TableHead className="text-right font-semibold text-xs pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground text-sm">
                      No team members match the search query or filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${getAvatarBg(
                              user.name,
                              user.role
                            )}`}
                          >
                            {getInitials(user.name)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm text-foreground flex items-center gap-1.5">
                              {user.name}
                              <span className="text-[10px] font-mono text-muted-foreground">({user.id})</span>
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3 opacity-60" />
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        {user.role === "Admin" && (
                          <Badge variant="purple" className="font-medium gap-1 text-[11px]">
                            <Shield className="w-3 h-3" /> Admin
                          </Badge>
                        )}
                        {user.role === "Staff" && (
                          <Badge variant="info" className="font-medium gap-1 text-[11px]">
                            Staff
                          </Badge>
                        )}
                        {user.role === "Customer" && (
                          <Badge variant="warning" className="font-medium gap-1 text-[11px]">
                            Customer
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="py-3">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 opacity-50" />
                          {user.department}
                        </span>
                      </TableCell>

                      <TableCell className="py-3">
                        {user.status === "Active" ? (
                          <Badge variant="success" className="gap-1 text-[11px] font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1 text-[11px] font-medium">
                            <Lock className="w-3 h-3" /> Suspended
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="py-3">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3 opacity-60" />
                          {user.last_login}
                        </span>
                      </TableCell>

                      <TableCell className="py-3 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs px-2 gap-1"
                            onClick={() => handleToggleUserStatus(user.id)}
                            title={user.status === "Active" ? "Suspend Account" : "Activate Account"}
                          >
                            {user.status === "Active" ? (
                              <>
                                <UserX className="w-3.5 h-3.5 text-amber-600" />
                                <span>Suspend</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Activate</span>
                              </>
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Remove user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* TAB 2: FRAPPE DOCPERM MATRIX TABLE */}
        <TabsContent value="permissions" className="space-y-4 pt-2">
          {/* DocPerm Info Header */}
          <div className="bg-gradient-to-r from-blue-50/60 via-purple-50/30 to-background border rounded-lg p-4 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Frappe Framework DocPerm Permission Engine
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
                  DocPerm rules enforce document-level CRUD along with Frappe workflow transitions (<strong>Submit</strong> sets DocStatus 1, <strong>Cancel</strong> sets DocStatus 2). Click any interactive checkmark below to toggle rights.
                </p>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={handleResetDocPerms}
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset Defaults
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 text-xs gap-1.5 shadow-xs"
                  onClick={handleSaveDocPerms}
                  disabled={!hasUnsavedPerms}
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </Button>
              </div>
            </div>
          </div>

          {/* DocPerm Matrix Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-lg border shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Filter by Role:</span>
              <div className="flex items-center gap-1">
                {["all", ...ALL_ROLES].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setPermRoleFilter(role)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      permRoleFilter === role
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {role === "all" ? "All Roles" : role}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">DocType:</span>
              <Select
                value={permDocTypeFilter}
                onChange={(e) => setPermDocTypeFilter(e.target.value)}
                className="w-40 h-8 text-xs"
              >
                <option value="all">All DocTypes</option>
                {ALL_DOC_TYPES.map((dt) => (
                  <option key={dt} value={dt}>
                    {dt}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="rounded-lg border bg-card shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="font-semibold text-xs w-[180px]">DocType</TableHead>
                  <TableHead className="font-semibold text-xs w-[120px]">Role</TableHead>
                  <TableHead className="text-center font-semibold text-xs w-[90px]">Read</TableHead>
                  <TableHead className="text-center font-semibold text-xs w-[90px]">Write</TableHead>
                  <TableHead className="text-center font-semibold text-xs w-[90px]">Create</TableHead>
                  <TableHead className="text-center font-semibold text-xs w-[90px]">Delete</TableHead>
                  <TableHead className="text-center font-semibold text-xs w-[90px]">Submit</TableHead>
                  <TableHead className="text-center font-semibold text-xs w-[90px]">Cancel</TableHead>
                  <TableHead className="text-center font-semibold text-xs w-[110px]">Permission Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocPerms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-28 text-center text-muted-foreground text-sm">
                      No DocPerm rules match the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocPerms.map((rule) => {
                    const ruleScore = [
                      rule.read,
                      rule.write,
                      rule.create,
                      rule.delete,
                      rule.submit,
                      rule.cancel,
                    ].filter(Boolean).length;

                    return (
                      <TableRow
                        key={`${rule.doc_type}-${rule.role}`}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="font-semibold text-xs py-3">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-primary/60" />
                            {rule.doc_type}
                          </span>
                        </TableCell>

                        <TableCell className="py-3">
                          {rule.role === "Admin" && (
                            <Badge variant="purple" className="text-[11px] font-medium">
                              Admin
                            </Badge>
                          )}
                          {rule.role === "Staff" && (
                            <Badge variant="info" className="text-[11px] font-medium">
                              Staff
                            </Badge>
                          )}
                          {rule.role === "Customer" && (
                            <Badge variant="warning" className="text-[11px] font-medium">
                              Customer
                            </Badge>
                          )}
                        </TableCell>

                        {/* Interactive Checkmark: Read */}
                        <TableCell className="text-center py-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleDocPerm(rule.doc_type, rule.role, "read")
                            }
                            className={`w-7 h-7 mx-auto rounded flex items-center justify-center transition-all ${
                              rule.read
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
                                : "bg-muted/40 text-muted-foreground/40 hover:bg-muted border border-transparent"
                            }`}
                            title={`Toggle Read for ${rule.role} on ${rule.doc_type}`}
                          >
                            {rule.read ? (
                              <Check className="w-4 h-4 stroke-[3]" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </TableCell>

                        {/* Interactive Checkmark: Write */}
                        <TableCell className="text-center py-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleDocPerm(rule.doc_type, rule.role, "write")
                            }
                            className={`w-7 h-7 mx-auto rounded flex items-center justify-center transition-all ${
                              rule.write
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
                                : "bg-muted/40 text-muted-foreground/40 hover:bg-muted border border-transparent"
                            }`}
                            title={`Toggle Write for ${rule.role} on ${rule.doc_type}`}
                          >
                            {rule.write ? (
                              <Check className="w-4 h-4 stroke-[3]" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </TableCell>

                        {/* Interactive Checkmark: Create */}
                        <TableCell className="text-center py-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleDocPerm(rule.doc_type, rule.role, "create")
                            }
                            className={`w-7 h-7 mx-auto rounded flex items-center justify-center transition-all ${
                              rule.create
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
                                : "bg-muted/40 text-muted-foreground/40 hover:bg-muted border border-transparent"
                            }`}
                            title={`Toggle Create for ${rule.role} on ${rule.doc_type}`}
                          >
                            {rule.create ? (
                              <Check className="w-4 h-4 stroke-[3]" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </TableCell>

                        {/* Interactive Checkmark: Delete */}
                        <TableCell className="text-center py-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleDocPerm(rule.doc_type, rule.role, "delete")
                            }
                            className={`w-7 h-7 mx-auto rounded flex items-center justify-center transition-all ${
                              rule.delete
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
                                : "bg-muted/40 text-muted-foreground/40 hover:bg-muted border border-transparent"
                            }`}
                            title={`Toggle Delete for ${rule.role} on ${rule.doc_type}`}
                          >
                            {rule.delete ? (
                              <Check className="w-4 h-4 stroke-[3]" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </TableCell>

                        {/* Interactive Checkmark: Submit */}
                        <TableCell className="text-center py-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleDocPerm(rule.doc_type, rule.role, "submit")
                            }
                            className={`w-7 h-7 mx-auto rounded flex items-center justify-center transition-all ${
                              rule.submit
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300"
                                : "bg-muted/40 text-muted-foreground/40 hover:bg-muted border border-transparent"
                            }`}
                            title={`Toggle Submit (Workflow DocStatus 1) for ${rule.role} on ${rule.doc_type}`}
                          >
                            {rule.submit ? (
                              <Check className="w-4 h-4 stroke-[3]" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </TableCell>

                        {/* Interactive Checkmark: Cancel */}
                        <TableCell className="text-center py-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleDocPerm(rule.doc_type, rule.role, "cancel")
                            }
                            className={`w-7 h-7 mx-auto rounded flex items-center justify-center transition-all ${
                              rule.cancel
                                ? "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300"
                                : "bg-muted/40 text-muted-foreground/40 hover:bg-muted border border-transparent"
                            }`}
                            title={`Toggle Cancel (Workflow DocStatus 2) for ${rule.role} on ${rule.doc_type}`}
                          >
                            {rule.cancel ? (
                              <Check className="w-4 h-4 stroke-[3]" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </TableCell>

                        <TableCell className="text-center py-3">
                          <Badge
                            variant={ruleScore >= 5 ? "success" : ruleScore >= 3 ? "info" : "outline"}
                            className="text-[10px] font-mono px-1.5"
                          >
                            {ruleScore} / 6
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* DocPerm Explanation Legend */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-muted-foreground bg-muted/20 p-4 rounded-lg border">
            <div>
              <strong className="text-foreground block mb-1">Standard CRUD Rights</strong>
              <p>Read (view records), Write (update editable fields), Create (new draft doc), Delete (trash records).</p>
            </div>
            <div>
              <strong className="text-foreground block mb-1">Frappe Submit Right</strong>
              <p>Transitions document to DocStatus 1 (Submitted). Locks key accounting terms and triggers automated ledger postings.</p>
            </div>
            <div>
              <strong className="text-foreground block mb-1">Frappe Cancel Right</strong>
              <p>Transitions document to DocStatus 2 (Cancelled). Voids accounting entries or active recurrent subscription contracts.</p>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: USER ACTIVITY AUDIT LOG */}
        <TabsContent value="audit" className="space-y-4 pt-2">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-lg border shadow-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search audit trail, action, doc..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>

            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Immutable audit log trail</span>
            </div>
          </div>

          {/* Activity Log Table */}
          <div className="rounded-lg border bg-card shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold text-xs w-[140px]">Timestamp</TableHead>
                  <TableHead className="font-semibold text-xs w-[180px]">User</TableHead>
                  <TableHead className="font-semibold text-xs w-[180px]">Action</TableHead>
                  <TableHead className="font-semibold text-xs w-[140px]">Target Doc</TableHead>
                  <TableHead className="font-semibold text-xs">Event Details</TableHead>
                  <TableHead className="font-semibold text-xs text-right pr-6 w-[120px]">IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-28 text-center text-muted-foreground text-sm">
                      No security audit events match the query.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="py-3 text-xs text-muted-foreground font-mono">
                        {log.timestamp}
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${getAvatarBg(
                              log.user_name,
                              log.role
                            )}`}
                          >
                            {getInitials(log.user_name)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-foreground">
                              {log.user_name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{log.role}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <Badge
                          variant={
                            log.action.includes("Suspended")
                              ? "destructive"
                              : log.action.includes("Modification")
                              ? "info"
                              : log.action.includes("DocPerm")
                              ? "purple"
                              : "secondary"
                          }
                          className="text-[11px] font-medium"
                        >
                          {log.action}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3 text-xs">
                        {log.doc_id ? (
                          <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded border text-[11px]">
                            {log.doc_id}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </TableCell>

                      <TableCell className="py-3 text-xs text-foreground/90">
                        {log.details}
                      </TableCell>

                      <TableCell className="py-3 text-right pr-6 font-mono text-xs text-muted-foreground">
                        {log.ip_address || "Internal"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* "+ INVITE USER" DIALOG */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <form onSubmit={handleInviteSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Invite Team Member
            </DialogTitle>
            <DialogDescription>
              Provision a new user account with Frappe Role permissions and workspace access.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            {inviteError && (
              <div className="p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {inviteError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Full Name *</label>
              <Input
                placeholder="e.g. Rachel Adams"
                value={inviteForm.name}
                onChange={(e) =>
                  setInviteForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="text-xs h-9"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Work Email *</label>
              <Input
                type="email"
                placeholder="rachel.adams@brightloop.io"
                value={inviteForm.email}
                onChange={(e) =>
                  setInviteForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="text-xs h-9"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">System Role *</label>
                <Select
                  value={inviteForm.role}
                  onChange={(e) =>
                    setInviteForm((prev) => ({
                      ...prev,
                      role: e.target.value as UserRole,
                    }))
                  }
                  className="text-xs h-9"
                >
                  <option value="Staff">Staff (Operations / Billing)</option>
                  <option value="Admin">Admin (Full Control)</option>
                  <option value="Customer">Customer (Portal Only)</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Department / Scope</label>
                <Input
                  placeholder="e.g. Billing & Accounts"
                  value={inviteForm.department}
                  onChange={(e) =>
                    setInviteForm((prev) => ({
                      ...prev,
                      department: e.target.value,
                    }))
                  }
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Contact Phone (Optional)</label>
              <Input
                placeholder="+1 (555) 012-3456"
                value={inviteForm.phone}
                onChange={(e) =>
                  setInviteForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="text-xs h-9"
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setInviteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="gap-1.5 shadow-xs">
              <UserPlus className="w-4 h-4" /> Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
};
