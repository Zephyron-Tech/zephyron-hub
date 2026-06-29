import { NextResponse } from "next/server";

const STATUS_PAGE_URL = "https://status.zephyron.tech";
const SLUG = "zephyron";

export const revalidate = 30;

interface Monitor {
  id: number;
  name: string;
  certExpiryDaysRemaining?: number | null;
  validCert?: boolean | null;
}

interface Heartbeat {
  status: number;
  ping: number | null;
}

export async function GET() {
  try {
    const [pageRes, heartbeatRes] = await Promise.all([
      fetch(`${STATUS_PAGE_URL}/api/status-page/${SLUG}`, { next: { revalidate: 30 } }),
      fetch(`${STATUS_PAGE_URL}/api/status-page/heartbeat/${SLUG}`, { next: { revalidate: 30 } }),
    ]);

    if (!pageRes.ok || !heartbeatRes.ok) {
      return NextResponse.json({ groups: [] }, { status: 502 });
    }

    const pageData = await pageRes.json();
    const heartbeatData = await heartbeatRes.json();
    const rawGroups: { name: string; monitorList: Monitor[] }[] = pageData.publicGroupList ?? [];

    const groups = rawGroups.map((g) => ({
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

    return NextResponse.json({ groups });
  } catch {
    return NextResponse.json({ groups: [] }, { status: 502 });
  }
}
