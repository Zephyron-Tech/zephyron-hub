import { Activity } from "lucide-react";

const STATUS_PAGE_URL = "https://status.zephyron.tech";
const SLUG = "zephyron";

interface Monitor {
  id: number;
  name: string;
  certExpiryDaysRemaining?: number | null;
  validCert?: boolean | null;
}

interface Group {
  name: string;
  monitorList: Monitor[];
}

interface Heartbeat {
  status: number;
  ping: number | null;
}

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

async function fetchStatusData(): Promise<GroupStatus[] | null> {
  try {
    const [pageRes, heartbeatRes] = await Promise.all([
      fetch(`${STATUS_PAGE_URL}/api/status-page/${SLUG}`, { next: { revalidate: 60 } }),
      fetch(`${STATUS_PAGE_URL}/api/status-page/heartbeat/${SLUG}`, { next: { revalidate: 60 } }),
    ]);

    if (!pageRes.ok || !heartbeatRes.ok) return null;

    const pageData = await pageRes.json();
    const heartbeatData = await heartbeatRes.json();
    const groups: Group[] = pageData.publicGroupList ?? [];

    return groups.map((g) => ({
      name: g.name,
      monitors: g.monitorList.map((m) => {
        const beats: Heartbeat[] = heartbeatData.heartbeatList?.[m.id] ?? [];
        const latest = beats[beats.length - 1] ?? null;
        const uptime = heartbeatData.uptimeList?.[`${m.id}_24`] ?? null;
        return {
          id: m.id,
          name: m.name,
          status: latest?.status ?? 2,
          ping: latest?.ping ?? null,
          uptime24h: uptime !== null ? Math.round(uptime * 100) / 100 : null,
          certDays: m.certExpiryDaysRemaining ?? null,
          validCert: m.validCert ?? null,
        };
      }),
    }));
  } catch {
    return null;
  }
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

export async function StatusWidget() {
  const groups = await fetchStatusData();
  if (!groups || groups.length === 0) return null;

  const allMonitors = groups.flatMap((g) => g.monitors);
  const anyDown = allMonitors.some((m) => m.status === 0);
  const allUp = allMonitors.every((m) => m.status === 1);
  const overallColor = anyDown ? "var(--danger-500)" : allUp ? "var(--success-500)" : "var(--warning-500)";
  const overallLabel = anyDown ? "Výpadek" : allUp ? "Vše funguje" : "Degradováno";
  const showGroupHeaders = groups.length > 1;
  const hasCerts = allMonitors.some((m) => m.certDays !== null);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 960,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* Hlavička widgetu */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Activity size={15} strokeWidth={1.5} style={{ color: "var(--fg-subtle)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--fg-muted)" }}>
            Status
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: overallColor }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-muted)" }}>{overallLabel}</span>
        </div>
      </div>

      {/* Skupiny */}
      {groups.map((group, gi) => (
        <div key={group.name}>
          {showGroupHeaders && (
            <div
              style={{
                padding: "10px 24px",
                borderBottom: "1px solid var(--border)",
                background: "rgba(1, 15, 34, 0.4)",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fg-subtle)" }}>
                {group.name}
              </span>
            </div>
          )}

          {group.monitors.map((m, i) => {
            const isLast = i === group.monitors.length - 1;
            const isLastGroup = gi === groups.length - 1;
            return (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 24px",
                  borderBottom: isLast && isLastGroup ? "none" : "1px solid var(--border)",
                }}
              >
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor(m.status), flexShrink: 0 }} />

                <span style={{ flex: 1, fontSize: 14, color: "var(--fg)", fontWeight: 500 }}>{m.name}</span>

                {/* Cert expiry */}
                {hasCerts && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: m.certDays !== null ? certColor(m.certDays, m.validCert) : "var(--fg-subtle)",
                      minWidth: 60,
                      textAlign: "right",
                    }}
                    title={m.certDays !== null ? `Certifikát vyprší za ${m.certDays} dní` : undefined}
                  >
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
      ))}

      {/* Footer */}
      <div style={{ padding: "10px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
        <a
          href={`${STATUS_PAGE_URL}/status/${SLUG}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 12, color: "var(--fg-subtle)", textDecoration: "none" }}
        >
          Otevřít v Uptime Kuma →
        </a>
      </div>
    </div>
  );
}
