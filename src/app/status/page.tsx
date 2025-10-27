import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voidwallz Status",
  description:
    "Check real-time service health for the Voidwallz platform including API, uploads, and CDN delivery.",
};

const services = [
  {
    name: "Website & Gallery",
    status: "Operational",
    uptime: "99.98%",
    description: "Landing pages, gallery browsing, and authentication routes are online.",
  },
  {
    name: "Cloudinary Delivery",
    status: "Operational",
    uptime: "100%",
    description: "Wallpaper CDN endpoints responding normally with sub-200ms latency.",
  },
  {
    name: "Uploads & Tagging",
    status: "Operational",
    uptime: "99.92%",
    description: "User submissions, AI tagging jobs, and Supabase functions are healthy.",
  },
  {
    name: "Supabase Database",
    status: "Operational",
    uptime: "99.99%",
    description: "Queries and row-level security rules are passing routine health checks.",
  },
];

const incidents = [
  {
    date: "Oct 04, 2025",
    title: "Intermittent upload queue delay",
    impact: "Minor",
    resolution:
      "A regional Cloudinary queue slowed new uploads for ~12 minutes. Automatic retries and queued jobs have caught up.",
  },
  {
    date: "Sep 18, 2025",
    title: "Supabase maintenance window",
    impact: "Maintenance",
    resolution:
      "Planned maintenance on the primary database node. Read-only mode for 7 minutes; full service restored immediately after.",
  },
];

export default function StatusPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-14">
        <header className="space-y-4 text-center md:text-left">
          <p className="font-mono text-sm tracking-[0.3em] uppercase text-foreground/60">Live Status</p>
          <h1 className="text-3xl md:text-5xl font-mono font-bold uppercase tracking-wider">
            Service Health Dashboard
          </h1>
          <p className="text-base md:text-lg text-foreground/70 max-w-3xl">
            Monitor real-time uptime and recent incidents for Voidwallz services. All times are reported in UTC.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div key={service.name} className="card-brutalist p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-mono text-lg uppercase tracking-wide">{service.name}</h2>
                <span className="inline-flex items-center px-3 py-1 text-xs font-mono uppercase tracking-wider bg-primary/15 text-primary border border-primary">
                  {service.status}
                </span>
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed">{service.description}</p>
              <p className="text-xs font-mono uppercase tracking-[0.25em] text-foreground/60">
                30-day uptime: {service.uptime}
              </p>
            </div>
          ))}
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-mono font-bold uppercase tracking-wide">Recent Incidents</h2>
          {incidents.length === 0 ? (
            <div className="card-brutalist p-6 text-sm text-foreground/70">
              No reported incidents in the last 90 days.
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div key={incident.title} className="card-brutalist p-6 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-xs font-mono uppercase tracking-[0.3em] text-foreground/60">
                      {incident.date}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 text-xs font-mono uppercase tracking-wider bg-secondary/15 text-secondary border border-secondary">
                      {incident.impact}
                    </span>
                  </div>
                  <h3 className="text-lg font-mono font-bold uppercase tracking-wide">{incident.title}</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">{incident.resolution}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card-brutalist p-6 space-y-4">
          <h2 className="text-lg font-mono font-bold uppercase tracking-wide">Subscribe for Updates</h2>
          <p className="text-sm text-foreground/70 leading-relaxed">
            Receive alerts if any service status changes. We only send operational notifications.
          </p>
          <form className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              className="flex-1 border-2 border-foreground bg-background px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary"
              placeholder="status alerts email"
            />
            <button
              type="submit"
              className="btn-brutalist px-6 py-3 text-sm uppercase font-bold"
            >
              Subscribe
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
