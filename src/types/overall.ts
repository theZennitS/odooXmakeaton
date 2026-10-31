import { WorkspaceId } from "./index";

export type MetricStatus = "healthy" | "idle" | "degraded" | "critical";

export interface SystemHealthMetric {
  id: string;
  name: string;
  status: MetricStatus;
  value: string | number;
  unit?: string;
  targetSla?: string;
  description: string;
  lastChecked: string;
  trend?: "up" | "down" | "stable";
}

export type NotificationCategory = "billing" | "cron" | "security" | "system";

export type NotificationFilterTab = "All" | "Billing" | "Automated Cron" | "Security";

export interface NotificationCenterItem {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  categoryLabel?: NotificationFilterTab;
  timestamp: string;
  relativeTime: string;
  read: boolean;
  severity: "info" | "success" | "warning" | "error";
  actionLabel?: string;
  actionWorkspace?: WorkspaceId;
  actionDocId?: string;
}

export type AuditActionType =
  | "Invoice Gen"
  | "Payment"
  | "Status Change"
  | "Config Update";

export type AuditStatusType = "Success" | "Warning" | "Failure";

export interface AuditLedgerRecord {
  id: string;
  timestamp: string;
  actor: string;
  action: AuditActionType;
  entity: string;
  status: AuditStatusType;
  details: string;
  ipAddress?: string;
}

export interface EngineTelemetry {
  engineVersion: string;
  cronWorkerStatus: "Healthy" | "Idle" | "Running" | "Degraded";
  cronFrequency: string;
  uptimePercentage: number;
  averageLatencyMs: number;
  slaLimitMs: number;
  databaseRecordsCount: number;
  storageQuota: {
    usedBytes: number;
    maxBytes: number;
    usagePercent: number;
    formattedUsed: string;
    formattedMax: string;
    keyCount: number;
  };
  systemMetrics: SystemHealthMetric[];
  lastCronRun: string;
  idempotencyEnforced: boolean;
  zeroDoubleBillingPass: boolean;
}
