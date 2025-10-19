"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { FadeInUp } from "@/components/scroll-animations";
import { useRouter } from "next/navigation";

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "urgent";
type TicketType = "bug" | "suggestion" | "issue" | "other";

interface Ticket {
  id: string;
  user_email: string;
  user_name: string | null;
  ticket_type: TicketType;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  comment_count: number;
  attachment_count: number;
  browser_info: string | null;
  device_info: string | null;
}

interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  bugs: number;
  suggestions: number;
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    bugs: 0,
    suggestions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "all">("all");
  const [filterType, setFilterType] = useState<TicketType | "all">("all");
  const [filterPriority, setFilterPriority] = useState<TicketPriority | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [adminComment, setAdminComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadTickets();
    }
  }, [isAdmin]);

  useEffect(() => {
    applyFilters();
  }, [tickets, filterStatus, filterType, filterPriority, searchQuery]);

  const checkAdminAccess = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/");
      return;
    }

    // Check if user has admin role
    const adminRole = user.user_metadata?.role === "admin";
    if (!adminRole) {
      router.push("/");
      return;
    }

    setIsAdmin(true);
  };

  const loadTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_ticket_dashboard")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const ticketData = data as Ticket[];
      setTickets(ticketData);
      calculateStats(ticketData);
    } catch (error) {
      console.error("Error loading tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ticketData: Ticket[]) => {
    const newStats: TicketStats = {
      total: ticketData.length,
      open: ticketData.filter((t) => t.status === "open").length,
      in_progress: ticketData.filter((t) => t.status === "in_progress").length,
      resolved: ticketData.filter((t) => t.status === "resolved").length,
      closed: ticketData.filter((t) => t.status === "closed").length,
      bugs: ticketData.filter((t) => t.ticket_type === "bug").length,
      suggestions: ticketData.filter((t) => t.ticket_type === "suggestion")
        .length,
    };
    setStats(newStats);
  };

  const applyFilters = () => {
    let filtered = [...tickets];

    if (filterStatus !== "all") {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    if (filterType !== "all") {
      filtered = filtered.filter((t) => t.ticket_type === filterType);
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter((t) => t.priority === filterPriority);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.subject.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.user_email.toLowerCase().includes(query) ||
          t.user_name?.toLowerCase().includes(query),
      );
    }

    setFilteredTickets(filtered);
  };

  const updateTicketStatus = async (ticketId: string, status: TicketStatus) => {
    try {
      const updateData: any = { status };
      if (status === "resolved" || status === "closed") {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("support_tickets")
        .update(updateData)
        .eq("id", ticketId);

      if (error) throw error;

      await loadTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update ticket status");
    }
  };

  const updateTicketPriority = async (
    ticketId: string,
    priority: TicketPriority,
  ) => {
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ priority })
        .eq("id", ticketId);

      if (error) throw error;

      await loadTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, priority });
      }
    } catch (error) {
      console.error("Error updating priority:", error);
      alert("Failed to update ticket priority");
    }
  };

  const submitComment = async () => {
    if (!selectedTicket || !adminComment.trim()) return;

    setSubmittingComment(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("support_ticket_comments").insert({
        ticket_id: selectedTicket.id,
        user_id: user?.id,
        user_email: user?.email || "admin",
        user_name: "Admin",
        comment: adminComment,
        is_admin: true,
        is_internal: false,
      });

      if (error) throw error;

      setAdminComment("");
      alert("Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return "bg-red-500/10 text-red-600 border-red-600";
      case "in_progress":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-600";
      case "resolved":
        return "bg-green-500/10 text-green-600 border-green-600";
      case "closed":
        return "bg-gray-500/10 text-gray-600 border-gray-600";
      default:
        return "bg-foreground/10 text-foreground border-foreground";
    }
  };

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/10 text-red-600 border-red-600";
      case "high":
        return "bg-orange-500/10 text-orange-600 border-orange-600";
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-600";
      case "low":
        return "bg-blue-500/10 text-blue-600 border-blue-600";
      default:
        return "bg-foreground/10 text-foreground border-foreground";
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="lock-closed" className="w-16 h-16 mx-auto mb-4" />
          <p className="font-mono uppercase">Access Denied</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <FadeInUp>
          <div className="text-center mb-8">
            <div className="h-[80px] md:h-[120px] flex items-center justify-center mb-2 md:mb-4">
              <TextHoverEffect text="ADMIN TICKETS" />
            </div>
          </div>
        </FadeInUp>

        {/* Stats Dashboard */}
        <FadeInUp delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            {[
              { label: "Total", value: stats.total, icon: "grid" },
              { label: "Open", value: stats.open, icon: "bell" },
              { label: "In Progress", value: stats.in_progress, icon: "arrow-path" },
              { label: "Resolved", value: stats.resolved, icon: "check-circle" },
              { label: "Closed", value: stats.closed, icon: "x-mark" },
              { label: "Bugs", value: stats.bugs, icon: "bug" },
              { label: "Suggestions", value: stats.suggestions, icon: "lightbulb" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="card-brutalist p-4 text-center"
              >
                <Icon name={stat.icon as any} className="w-6 h-6 mx-auto mb-2" />
                <div className="text-2xl font-bold font-mono">{stat.value}</div>
                <div className="text-xs font-mono uppercase text-foreground/70">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </FadeInUp>

        {/* Filters */}
        <FadeInUp delay={0.2}>
          <div className="card-brutalist p-6 mb-8">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 pr-12 border-2 border-foreground bg-background text-foreground font-mono",
                    "shadow-[4px_4px_0px_0px_var(--color-foreground)]",
                    "focus:outline-none focus:bg-card",
                  )}
                />
                <Icon
                  name="magnifying-glass"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5"
                />
              </div>

              {/* Filter Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-mono uppercase mb-2 text-foreground/70">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) =>
                      setFilterStatus(e.target.value as TicketStatus | "all")
                    }
                    className={cn(
                      "w-full px-4 py-2 border-2 border-foreground bg-background text-foreground font-mono text-sm",
                      "shadow-[3px_3px_0px_0px_var(--color-foreground)]",
                      "focus:outline-none",
                    )}
                  >
                    <option value="all">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-xs font-mono uppercase mb-2 text-foreground/70">
                    Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) =>
                      setFilterType(e.target.value as TicketType | "all")
                    }
                    className={cn(
                      "w-full px-4 py-2 border-2 border-foreground bg-background text-foreground font-mono text-sm",
                      "shadow-[3px_3px_0px_0px_var(--color-foreground)]",
                      "focus:outline-none",
                    )}
                  >
                    <option value="all">All Types</option>
                    <option value="bug">Bug</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="issue">Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-xs font-mono uppercase mb-2 text-foreground/70">
                    Priority
                  </label>
                  <select
                    value={filterPriority}
                    onChange={(e) =>
                      setFilterPriority(
                        e.target.value as TicketPriority | "all",
                      )
                    }
                    className={cn(
                      "w-full px-4 py-2 border-2 border-foreground bg-background text-foreground font-mono text-sm",
                      "shadow-[3px_3px_0px_0px_var(--color-foreground)]",
                      "focus:outline-none",
                    )}
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* Tickets List */}
        <FadeInUp delay={0.3}>
          <div className="space-y-4">
            {loading ? (
              <div className="card-brutalist p-8 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="font-mono text-sm uppercase">Loading tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="card-brutalist p-8 text-center">
                <Icon name="info" className="w-12 h-12 mx-auto mb-4 text-foreground/50" />
                <p className="font-mono text-sm uppercase text-foreground/70">
                  No tickets found
                </p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={cn(
                    "card-brutalist p-6 cursor-pointer transition-all duration-200",
                    selectedTicket?.id === ticket.id
                      ? "border-primary shadow-[6px_6px_0px_0px_var(--color-primary)]"
                      : "hover:translate-x-[-2px] hover:translate-y-[-2px]",
                  )}
                  onClick={() =>
                    setSelectedTicket(
                      selectedTicket?.id === ticket.id ? null : ticket,
                    )
                  }
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
                        <Icon
                          name={
                            ticket.ticket_type === "bug"
                              ? "bug"
                              : ticket.ticket_type === "suggestion"
                                ? "lightbulb"
                                : ticket.ticket_type === "issue"
                                  ? "exclamation-circle"
                                  : "chat-bubble"
                          }
                          className="w-5 h-5 mt-0.5 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <h3 className="font-mono font-bold text-lg mb-1">
                            {ticket.subject}
                          </h3>
                          <p className="text-sm text-foreground/70 font-mono mb-2">
                            {ticket.user_name || ticket.user_email}
                          </p>
                          <p className="text-sm text-foreground/80 line-clamp-2">
                            {ticket.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap md:flex-col gap-2 items-start">
                      <span
                        className={cn(
                          "px-3 py-1 text-xs font-mono uppercase border-2",
                          getStatusColor(ticket.status),
                        )}
                      >
                        {ticket.status.replace("_", " ")}
                      </span>
                      <span
                        className={cn(
                          "px-3 py-1 text-xs font-mono uppercase border-2",
                          getPriorityColor(ticket.priority),
                        )}
                      >
                        {ticket.priority}
                      </span>
                      <span className="px-3 py-1 text-xs font-mono uppercase border-2 border-foreground bg-card">
                        {ticket.ticket_type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-xs font-mono text-foreground/60">
                    <span>
                      Created: {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                    <span>💬 {ticket.comment_count}</span>
                    <span>📎 {ticket.attachment_count}</span>
                  </div>

                  {/* Expanded Details */}
                  {selectedTicket?.id === ticket.id && (
                    <div className="mt-6 pt-6 border-t-2 border-foreground space-y-6">
                      {/* Full Description */}
                      <div>
                        <h4 className="font-mono font-bold text-sm uppercase mb-2">
                          Full Description
                        </h4>
                        <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                          {ticket.description}
                        </p>
                      </div>

                      {/* Technical Info */}
                      {(ticket.browser_info || ticket.device_info) && (
                        <div>
                          <h4 className="font-mono font-bold text-sm uppercase mb-2">
                            Technical Information
                          </h4>
                          <div className="space-y-1 text-xs font-mono text-foreground/70">
                            {ticket.browser_info && (
                              <p>Browser: {ticket.browser_info}</p>
                            )}
                            {ticket.device_info && (
                              <p>Device: {ticket.device_info}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Admin Actions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-mono uppercase mb-2">
                            Update Status
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {(
                              ["open", "in_progress", "resolved", "closed"] as TicketStatus[]
                            ).map((status) => (
                              <button
                                key={status}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateTicketStatus(ticket.id, status);
                                }}
                                className={cn(
                                  "px-3 py-2 text-xs font-mono uppercase border-2 transition-all",
                                  ticket.status === status
                                    ? getStatusColor(status)
                                    : "border-foreground bg-card hover:bg-primary hover:text-background",
                                )}
                              >
                                {status.replace("_", " ")}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase mb-2">
                            Update Priority
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {(
                              ["low", "medium", "high", "urgent"] as TicketPriority[]
                            ).map((priority) => (
                              <button
                                key={priority}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateTicketPriority(ticket.id, priority);
                                }}
                                className={cn(
                                  "px-3 py-2 text-xs font-mono uppercase border-2 transition-all",
                                  ticket.priority === priority
                                    ? getPriorityColor(priority)
                                    : "border-foreground bg-card hover:bg-primary hover:text-background",
                                )}
                              >
                                {priority}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Admin Comment */}
                      <div>
                        <label className="block text-xs font-mono uppercase mb-2">
                          Add Admin Response
                        </label>
                        <textarea
                          value={adminComment}
                          onChange={(e) => setAdminComment(e.target.value)}
                          placeholder="Type your response to the user..."
                          rows={4}
                          className={cn(
                            "w-full px-4 py-3 border-2 border-foreground bg-background text-foreground font-mono text-sm",
                            "shadow-[4px_4px_0px_0px_var(--color-foreground)]",
                            "focus:outline-none focus:bg-card resize-none",
                          )}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            submitComment();
                          }}
                          disabled={submittingComment || !adminComment.trim()}
                          className={cn(
                            "mt-2 px-6 py-3 border-2 border-foreground bg-primary text-background font-mono font-bold uppercase",
                            "shadow-[4px_4px_0px_0px_var(--color-foreground)]",
                            "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--color-foreground)]",
                            "transition-all duration-200",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                          )}
                        >
                          {submittingComment ? "Submitting..." : "Submit Response"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </FadeInUp>
      </div>
    </div>
  );
}
