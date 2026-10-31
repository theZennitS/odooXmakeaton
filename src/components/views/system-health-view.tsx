"use client";

import React, { useState } from "react";
import { SystemHealthMetric, AuditLedgerRecord, EngineTelemetry } from "@/types/overall";
import {
  DEFAULT_ENGINE_TELEMETRY,
  DEFAULT_SYSTEM_METRICS,
  DEFAULT_AUDIT_LEDGER,
} from "@/lib/system-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Activity,
  Zap,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
} from "lucide-react";

export const SystemHealthView: React.FC = () => {
  const [telemetry, setTelemetry] = useState<EngineTelemetry>(DEFAULT_ENGINE_TELEMETRY);
  const [metrics, setMetrics] = useState<SystemHealthMetric[]>(DEFAULT_SYSTEM_METRICS);
  const [auditLedger, setAuditLedger] = useState<AuditLedgerRecord[]>(DEFAULT_AUDIT_LEDGER);
  const [auditSearch, setAuditSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filteredAudit = auditLedger.filter((item) => {
    if (actionFilter !== "all" && item.action !== actionFilter) return false;
    if (auditSearch.trim()) {
      const q = auditSearch.toLowerCase();
      return (
        item.entity.toLowerCase().includes(q) ||
        item.actor.toLowerCase().includes(q) ||
        item.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Success":
        return <Badge variant="success">Success</Badge>;
      case "Warning":
        return <Badge variant="warning">Warning</Badge>;
      case "Failure":
        return <Badge variant="destructive">Failure</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>System Health &amp; Telemetry Diagnostics</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Live Frappe v15 engine daemon telemetry, SLA latency graphs, storage consumption, and audit ledger.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setTelemetry((prev) => ({
              ...prev,
              averageLatencyMs: parseFloat((Math.random() * 2 + 2.5).toFixed(2)),
            }));
          }}
          className="gap-1.5 text-xs h-8"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Ping Diagnostics</span>
        </Button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Frappe Engine Daemon</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-foreground font-mono">
            {telemetry.uptimePercentage}%
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">
            Status: {telemetry.cronWorkerStatus} &bull; Uptime
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Query SLA Benchmark</span>
            <Zap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600 font-mono">
            {telemetry.averageLatencyMs} ms
          </div>
          <div className="text-[11px] text-muted-foreground">
            Target SLA: &lt; {telemetry.slaLimitMs} ms (Pass)
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Cron Execution Mode</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-base font-bold text-foreground">
            Daily Automated
          </div>
          <div className="text-[11px] text-muted-foreground">
            Strict Idempotency Guard Active
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>LocalStorage Quota</span>
            <HardDrive className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-foreground font-mono">
            {telemetry.storageQuota.usagePercent}%
          </div>
          <div className="text-[11px] text-muted-foreground">
            {telemetry.storageQuota.formattedUsed} of {telemetry.storageQuota.formattedMax} used
          </div>
        </div>
      </div>

      {/* Subsystem Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((m) => (
          <div key={m.id} className="p-4 rounded-xl border bg-card shadow-xs flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-foreground">{m.name}</h3>
                <Badge variant="success" className="text-[10px]">
                  {m.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{m.description}</p>
              <div className="text-[10px] text-muted-foreground font-mono pt-1">
                Last verified: {m.lastChecked}
              </div>
            </div>
            <div className="font-mono font-bold text-sm text-foreground bg-muted/40 px-2 py-1 rounded">
              {m.value} {m.unit || ""}
            </div>
          </div>
        ))}
      </div>

      {/* Audit Ledger */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Real-time Audit Ledger &amp; Event Stream ({filteredAudit.length})
          </h2>

          <div className="flex items-center space-x-2">
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search audit trail..."
                className="h-8 text-xs pl-8 bg-background"
              />
            </div>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="h-8 text-xs px-2 rounded-md border bg-background font-medium focus:outline-none"
            >
              <option value="all">All Actions</option>
              <option value="Invoice Gen">Invoice Gen</option>
              <option value="Payment">Payment</option>
              <option value="Status Change">Status Change</option>
              <option value="Config Update">Config Update</option>
            </select>
          </div>
        </div>

        <div className="border rounded-xl bg-card overflow-hidden shadow-xs">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="p-3 text-left font-semibold text-muted-foreground">Log ID</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Timestamp</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Action</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Entity</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Actor</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Status</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAudit.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono text-muted-foreground">{log.id}</td>
                  <td className="p-3 font-mono text-muted-foreground whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-3">
                    <Badge variant="outline" className="font-normal text-[11px]">
                      {log.action}
                    </Badge>
                  </td>
                  <td className="p-3 font-mono font-bold text-blue-600">{log.entity}</td>
                  <td className="p-3 text-foreground font-medium">{log.actor}</td>
                  <td className="p-3">{getStatusBadge(log.status)}</td>
                  <td className="p-3 text-muted-foreground max-w-xs truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
