"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

const STATUS_PAGE_URL = "https://status.zephyron.tech";
const SLUG = "zephyron";
const POLL_INTERVAL = 30_000;

interface MonitorStatus {
  id: number;
  name: string;
  status: number;
  ping: number | null;
  uptime24h: number | null;
  certDays: number | null;
  validCert: boolean | null;
}

interface GroupStatus {
  name: string;
  monitors: MonitorStatus[];
}

function statusColor(status: number): string {
  if (status === 1) return "var(--success-500)";
  if (status === 0) return "var(--danger-500)";
  return "var(--warning-500)";
}

function statusLabel(status: number): string {
  if (status === 1) return "Online";
  if (status === 0) return "Offline";
  return "Čeká";
}

function certColor(days: number, valid: boolean | null): string {
  if (!valid) return "var(--danger-500)";
  if (days <= 7) return "var(--danger-500)";
  if (days <= 30) return "var(--warning-500)";
  return "var(--success-500)";
}

function SkeletonRow() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 24px", borderBottom: "1px solid var(--border)" }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(255,255,255,0.06)", flexShrink: 0 }} />
      <div style={{ flex: 1, height: 14, borderRadius: 4, background: "rgba(255,255,255,0.06)", animation: "sk-pulse 1.4s ease-in-out infinite" }} />
      <div style={{ width: 48, height: 12, borderRadius: 4, background: "rgba(255,255,255,0.04)", animation: "sk-pulse 1.4s ease-in-out infinite 0.2s" }} />
    </div>
  );
}

export function StatusWidget() {
  const [groups, setGroups] = useState<GroupStatus[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/status");
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) {
          setGroups(data.groups?.length ? data.groups : null);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    }

    load();
    const id = setInterval(load, POLL_INTERVAL);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  if (error) return null;

  const allMonitors = groups?.flatMap((g) => g.monitors) ?? [];
  const anyDown = allMonitors.some((m) => m.status === 0);
  const allUp = allMonitors.length > 0 && allMonitors.every((m) => m.status === 1);
  const overallColor = anyDown ? "var(--danger-500)" : allUp ? "var(--success-500)" : "var(--warning-500)";
  const overallLabel = anyDown ? "Výpadek" : allUp ? "Vše funguje" : "Degradováno";
  const showGroupHeaders = (groups?.length ?? 0) > 1;
  const hasCerts = allMonitors.some((m) => m.certDays !== null);

  return (
    <>
      <style>{`
        @keyframes sk-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>

      <div style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
        {/* Hlavička */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Activity size={15} strokeWidth={1.5} style={{ color: "var(--fg-subtle)" }} />
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--fg-muted)" }}>
              Status
            </span>
          </div>
          {groups && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: overallColor }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-muted)" }}>{overallLabel}</span>
            </div>
          )}
        </div>

        {/* Skeleton / data */}
        {!groups ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 24px" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(255,255,255,0.06)", flexShrink: 0 }} />
              <div style={{ flex: 1, height: 14, borderRadius: 4, background: "rgba(255,255,255,0.06)", animation: "sk-pulse 1.4s ease-in-out infinite 0.4s" }} />
              <div style={{ width: 48, height: 12, borderRadius: 4, background: "rgba(255,255,255,0.04)", animation: "sk-pulse 1.4s ease-in-out infinite 0.6s" }} />
            </div>
          </>
        ) : (
          groups.map((group, gi) => (
            <div key={group.name}>
              {showGroupHeaders && (
                <div style={{ padding: "10px 24px", borderBottom: "1px solid var(--border)", background: "rgba(1, 15, 34, 0.4)" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fg-subtle)" }}>
                    {group.name}
                  </span>
                </div>
              )}
              {group.monitors.map((m, i) => {
                const isLast = i === group.monitors.length - 1;
                const isLastGroup = gi === groups.length - 1;
                return (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 24px", borderBottom: isLast && isLastGroup ? "none" : "1px solid var(--border)" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor(m.status), flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 14, color: "var(--fg)", fontWeight: 500 }}>{m.name}</span>
                    {hasCerts && (
                      <span style={{ fontSize: 11, fontWeight: 500, color: m.certDays !== null ? certColor(m.certDays, m.validCert) : "var(--fg-subtle)", minWidth: 60, textAlign: "right" }} title={m.certDays !== null ? `Certifikát vyprší za ${m.certDays} dní` : undefined}>
                        {m.certDays !== null ? `SSL ${m.certDays}d` : "—"}
                      </span>
                    )}
                    {m.ping !== null && (
                      <span style={{ fontSize: 12, color: "var(--fg-subtle)", fontFamily: "monospace", minWidth: 54, textAlign: "right" }}>
                        {m.ping} ms
                      </span>
                    )}
                    {m.uptime24h !== null && (
                      <span style={{ fontSize: 12, color: "var(--fg-muted)", minWidth: 52, textAlign: "right" }}>
                        {m.uptime24h}%
                      </span>
                    )}
                    <span style={{ fontSize: 11, fontWeight: 500, color: statusColor(m.status), minWidth: 46, textAlign: "right" }}>
                      {statusLabel(m.status)}
                    </span>
                  </div>
                );
              })}
            </div>
          ))
        )}

        {/* Footer */}
        <div style={{ padding: "10px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
          <a href={`${STATUS_PAGE_URL}/status/${SLUG}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--fg-subtle)", textDecoration: "none" }}>
            Otevřít v Uptime Kuma →
          </a>
        </div>
      </div>
    </>
  );
}
