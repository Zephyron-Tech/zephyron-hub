import Image from "next/image";
import { BookOpen, Cloud, ShieldCheck, Github, Triangle, Server, Receipt, Kanban, Activity, ArrowUpRight } from "lucide-react";

const services = [
  {
    icon: BookOpen,
    name: "Wiki",
    description: "Interní dokumentace a znalostní báze",
    href: "https://wiki.zephyron.tech",
    delay: "rise-3",
  },
  {
    icon: Cloud,
    name: "Nextcloud",
    description: "Sdílené úložiště a spolupráce",
    href: "https://cloud.zephyron.tech",
    delay: "rise-4",
  },
  {
    icon: ShieldCheck,
    name: "Authentik",
    description: "Správa přihlašování a identit",
    href: "https://auth.zephyron.tech",
    delay: "rise-5",
  },
  {
    icon: Github,
    name: "GitHub",
    description: "Repozitáře Zephyron Tech organizace",
    href: "https://github.com/zephyron-tech",
    delay: "rise-3",
  },
  {
    icon: Triangle,
    name: "Vercel",
    description: "Dashboard a deploymenty frontendů",
    href: "https://vercel.com/jan-vandliceks-projects-9339ab69",
    delay: "rise-4",
  },
  {
    icon: Server,
    name: "Hetzner",
    description: "Cloud Console pro správu VPS",
    href: "https://console.hetzner.com/",
    delay: "rise-5",
  },
  {
    icon: Receipt,
    name: "Fakturoid",
    description: "Fakturace a účetnictví",
    href: "https://app.fakturoid.cz/",
    delay: "rise-3",
  },
  {
    icon: Kanban,
    name: "Nextcloud Deck",
    description: "Kanban tabule a správa úkolů",
    href: null,
    delay: "rise-4",
  },
  {
    icon: Activity,
    name: "Uptime Kuma",
    description: "Monitoring dostupnosti serverů",
    href: null,
    delay: "rise-5",
  },
];

export default function HubPage() {
  return (
    <main
      style={{
        position: "relative",
        zIndex: 1,
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header — logo vlevo */}
      <header
        className="rise rise-1"
        style={{
          padding: "28px clamp(24px, 5vw, 56px)",
          flexShrink: 0,
        }}
      >
        <a
          href="https://zephyron.tech"
          aria-label="Zephyron Tech"
          style={{ display: "inline-flex", alignItems: "center", gap: 12 }}
        >
          <Image
            src="/mark-color.png"
            alt=""
            width={36}
            height={36}
            priority
            style={{ width: "auto", height: 36 }}
          />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1, gap: 3, textAlign: "left" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 26, letterSpacing: "-0.02em", color: "var(--fg)" }}>
              Zephyron
            </span>
            <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 9, letterSpacing: "0.32em", color: "var(--fg-muted)" }}>
              TECH
            </span>
          </div>
        </a>
      </header>

      {/* Střed — nadpis + dlaždice */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 clamp(24px, 5vw, 56px)",
          paddingBottom: "8vh",
        }}
      >
        {/* Nadpis */}
        <div className="rise rise-2" style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", textAlign: "center", marginBottom: 48 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(40px, 7vw, 64px)",
              fontWeight: 600,
              color: "var(--fg)",
              letterSpacing: "-0.025em",
            }}
          >
            Hub
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--fg-brand)",
            }}
          >
            Interní služby
          </p>
        </div>

        {/* Dlaždice */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
            width: "100%",
            maxWidth: 960,
          }}
        >
          {services.map(({ icon: Icon, name, description, href, delay }) => (
            <ServiceTile key={name} Icon={Icon} name={name} description={description} href={href} delay={delay} />
          ))}
        </div>
      </div>

      {/* Footer — copyright vpravo */}
      <footer
        style={{
          padding: "16px clamp(24px, 5vw, 56px)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "flex-end",
          flexShrink: 0,
        }}
      >
        <p style={{ fontSize: 13, color: "var(--fg-subtle)", letterSpacing: "0.02em" }}>
          © {new Date().getFullYear()} Zephyron Tech
        </p>
      </footer>
    </main>
  );
}

function ServiceTile({
  Icon,
  name,
  description,
  href,
  delay,
}: {
  Icon: React.ElementType;
  name: string;
  description: string;
  href: string | null;
  delay: string;
}) {
  const soon = href === null;

  const inner = (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: soon ? "rgba(110, 122, 145, 0.10)" : "rgba(88, 63, 255, 0.12)",
            border: `1px solid ${soon ? "rgba(110, 122, 145, 0.18)" : "rgba(88, 63, 255, 0.22)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={20} strokeWidth={1.5} style={{ color: soon ? "var(--fg-subtle)" : "var(--violet-400)" }} />
        </div>
        {soon ? (
          <span style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--fg-subtle)",
            background: "rgba(110, 122, 145, 0.12)",
            border: "1px solid rgba(110, 122, 145, 0.18)",
            borderRadius: 6,
            padding: "3px 8px",
            marginTop: 2,
          }}>
            Brzy
          </span>
        ) : (
          <ArrowUpRight size={16} strokeWidth={1.5} style={{ color: "var(--fg-subtle)", marginTop: 4 }} />
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            fontWeight: 600,
            color: soon ? "var(--fg-muted)" : "var(--fg)",
            letterSpacing: "-0.015em",
          }}
        >
          {name}
        </h2>
        <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--fg-subtle)" }}>{description}</p>
      </div>
    </>
  );

  if (soon) {
    return (
      <div
        className={`rise ${delay}`}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          padding: "28px 24px",
          background: "rgba(6, 18, 42, 0.5)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          opacity: 0.7,
          cursor: "default",
        }}
      >
        {inner}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`rise ${delay} service-tile`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        padding: "28px 24px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        transition: "border-color 200ms var(--ease-out), box-shadow 200ms var(--ease-out), transform 200ms var(--ease-out)",
        cursor: "pointer",
        textDecoration: "none",
      }}
    >
      {inner}
    </a>
  );
}
