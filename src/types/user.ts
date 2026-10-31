export type UserRole = "Admin" | "Staff" | "Customer";

export type DocType =
  | "Subscriptions"
  | "Invoices"
  | "Plans"
  | "Discounts"
  | "Reports";

export type DocPermAction =
  | "read"
  | "write"
  | "create"
  | "delete"
  | "submit"
  | "cancel";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: "Active" | "Suspended";
  last_login: string;
  avatar?: string;
  phone?: string;
  created_at: string;
}

export interface DocPermissionRule {
  doc_type: DocType | string;
  role: UserRole;
  read: boolean;
  write: boolean;
  create: boolean;
  delete: boolean;
  submit: boolean;
  cancel: boolean;
}

export type DocPermissionMatrix = DocPermissionRule[];

export interface UserActivityLogEntry {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  role: UserRole;
  action: string;
  doc_type?: DocType | string;
  doc_id?: string;
  details: string;
  timestamp: string;
  ip_address?: string;
  status?: "Success" | "Warning" | "Failed";
}
