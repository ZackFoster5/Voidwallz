"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { FadeInUp } from "@/components/scroll-animations";
import { useRouter } from "next/navigation";
import Link from "next/link";

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "urgent";
type TicketType = "bug" | "suggestion" | "issue" | "other";

interface Ticket {
  id: string;
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
}

interface Comment {
  id: string;
  user_name: string | null;
  comment: string;
  is_admin: boolean;
  created_at: string;
}

interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  created_at: string;
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [userComment, setUserComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "all">("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadTickets();
    }
  }, [isAuthenticated, filterStatus]);

  useEffect(() => {
    if (selectedTicket) {
      loadTicketDetails(selectedTicket.id);
    }
  }, [selectedTicket]);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/");
      return;
    }
    setIsAuthenticated(true);
  };

  const loadTickets = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("user_ticket_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      setTickets(data as Ticket[]);
    } catch (error) {
      console.error("Error loading tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTicketDetails = async (ticketId: string) => {
    setLoadingDetails(true);
    try {
      // Load comments
      const { data: commentsData, error: commentsError } = await supabase
        .from("support_ticket_comments")
        .select("*")
        .eq("ticket_id", ticketId)
        .eq("is_internal", false)
        .order("created_at", { ascending: true });

      if (commentsError) throw commentsError;

      // Load attachments
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from("support_ticket_attachments")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: false });

      if (attachmentsError) throw attachmentsError;

      setComments(commentsData as Comment[]);
      setAttachments(attachmentsData as Attachment[]);
    } catch (error) {
      console.error("Error loading ticket details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const submitComment = async () => {
    if (!selectedTicket || !userComment.trim()) return;

    setSubmittingComment(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("support_ticket_comments").insert({
        ticket_id: selectedTicket.id,
        user_id: user.id,
        user_email: user.email || "",
        user_name:
          user.user_metadata?.firstName
            ? `${user.user_metadata.firstName} ${user.user_metadata.lastName || ""}`
            : null,
        comment: userComment,
        is_admin: false,
        is_internal: false,
      });

      if (error) throw error;

      setUserComment("");
      loadTicketDetails(selectedTicket.id);
      loadTickets();
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
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

  const getTypeIcon = (type: TicketType): IconName => {
    switch (type) {
      case "bug":
        return "bug";
      case "suggestion":
        return "lightbulb";
      case "issue":
        return "exclamation-circle";
      default:
        return "chat-bubble";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono uppercase">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <FadeInUp>
          <div className="text-center mb-8">
            <div className="h-[80px] md:h-[140px] flex items-center justify-center mb-2 md:mb-4">
              <TextHoverEffect text="MY TICKETS" />
            </div>
            <p className="text-sm md:text-lg text-foreground/70 max-w-2xl mx-auto mb-6">
              Track and manage your support tickets
            </p>
            <Link
              href="/support"
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 border-2 border-foreground bg-primary text-background font-mono font-bold uppercase text-sm",
                "shadow-[4px_4px_0px_0px_var(--color-foreground)]",
                "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--color-foreground)]",
                "transition-all duration-200",
              )}
            >
              <Icon name="sparkles" className="w-4 h-4" />
              Submit New Ticket
            </Link>
          </div>
        </FadeInUp>

        {/* Filter */}
        <FadeInUp delay={0.1}>
          <div className="card-brutalist p-4 mb-6">
            <div className="flex items-center gap-3">
              <Icon name="funnel" className="w-5 h-5" />
              <span className="font-mono uppercase text-sm font-bold">
                Filter:
              </span>
              <div className="flex flex-wrap gap-2">
                {(["all", "open", "in_progress", "resolved", "closed"] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-mono uppercase border-2 transition-all",
                        filterStatus === status
                          ? "bg-primary text-background border-foreground shadow-[2px_2px_0px_0px_var(--color-foreground)]"
                          : "border-foreground bg-card hover:bg-primary hover:text-background",
                      )}
                    >
                      {status === "all" ? "All" : status.replace("_", " ")}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* Tickets List */}
        <FadeInUp delay={0.2}>
          <div className="space-y-4">
            {loading ? (
              <div className="card-brutalist p-8 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="font-mono text-sm uppercase">Loading tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="card-brutalist p-8 text-center">
                <Icon
                  name="info"
                  className="w-12 h-12 mx-auto mb-4 text-foreground/50"
                />
                <p className="font-mono text-sm uppercase text-foreground/70 mb-4">
                  No tickets found
                </p>
                <Link
                  href="/support"
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 border-2 border-foreground bg-card text-foreground font-mono font-bold uppercase text-sm",
                    "shadow-[3px_3px_0px_0px_var(--color-foreground)]",
                    "hover:bg-primary hover:text-background",
                    "transition-all duration-200",
                  )}
                >
                  Create Your First Ticket
                </Link>
              </div>
            ) : (
              tickets.map((ticket) => (
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
                          name={getTypeIcon(ticket.ticket_type)}
                          className="w-5 h-5 mt-0.5 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <h3 className="font-mono font-bold text-lg mb-2">
                            {ticket.subject}
                          </h3>
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
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-xs font-mono text-foreground/60">
                    <span>
                      Created: {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                    {ticket.comment_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Icon name="chat-bubble" className="w-3 h-3" />
                        {ticket.comment_count} {ticket.comment_count === 1 ? "reply" : "replies"}
                      </span>
                    )}
                    {ticket.attachment_count > 0 && (
                      <span>📎 {ticket.attachment_count}</span>
                    )}
                    {ticket.resolved_at && (
                      <span className="text-green-600">
                        Resolved: {new Date(ticket.resolved_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {selectedTicket?.id === ticket.id && (
                    <div className="mt-6 pt-6 border-t-2 border-foreground space-y-6">
                      {/* Full Description */}
                      <div>
                        <h4 className="font-mono font-bold text-sm uppercase mb-2 flex items-center gap-2">
                          <Icon name="info" className="w-4 h-4" />
                          Full Description
                        </h4>
                        <p className="text-sm text-foreground/80 whitespace-pre-wrap bg-card p-4 border-2 border-foreground">
                          {ticket.description}
                        </p>
                      </div>

                      {/* Attachments */}
                      {attachments.length > 0 && (
                        <div>
                          <h4 className="font-mono font-bold text-sm uppercase mb-3 flex items-center gap-2">
                            <Icon name="photo" className="w-4 h-4" />
                            Attachments ({attachments.length})
                          </h4>
                          <div className="space-y-2">
                            {attachments.map((attachment) => (
                              <a
                                key={attachment.id}
                                href={attachment.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 border-2 border-foreground bg-card hover:bg-primary hover:text-background transition-all"
                              >
                                <Icon name="download" className="w-4 h-4" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-mono truncate">
                                    {attachment.file_name}
                                  </p>
                                  <p className="text-xs font-mono text-foreground/60">
                                    {formatFileSize(attachment.file_size)} •{" "}
                                    {new Date(attachment.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <Icon name="arrow-up-right" className="w-4 h-4" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Comments Thread */}
                      <div>
                        <h4 className="font-mono font-bold text-sm uppercase mb-3 flex items-center gap-2">
                          <Icon name="chat-bubble" className="w-4 h-4" />
                          Conversation ({comments.length})
                        </h4>
                        {loadingDetails ? (
                          <div className="text-center py-8">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                          </div>
                        ) : comments.length === 0 ? (
                          <p className="text-sm font-mono text-foreground/60 text-center py-4 bg-card border-2 border-foreground">
                            No comments yet. Add one below!
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {comments.map((comment) => (
                              <div
                                key={comment.id}
                                className={cn(
                                  "p-4 border-2 border-foreground",
                                  comment.is_admin
                                    ? "bg-primary/5 border-l-4 border-l-primary"
                                    : "bg-card",
                                )}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    {comment.is_admin ? (
                                      <span className="px-2 py-0.5 bg-primary text-background text-xs font-mono uppercase font-bold">
                                        Admin
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 bg-card border border-foreground text-xs font-mono uppercase">
                                        You
                                      </span>
                                    )}
                                    <span className="text-xs font-mono text-foreground/60">
                                      {comment.user_name || "User"}
                                    </span>
                                  </div>
                                  <span className="text-xs font-mono text-foreground/50">
                                    {new Date(comment.created_at).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                                  {comment.comment}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Add Comment */}
                      {ticket.status !== "closed" && (
                        <div>
                          <label className="block text-xs font-mono uppercase mb-2 font-bold">
                            Add a Comment
                          </label>
                          <textarea
                            value={userComment}
                            onChange={(e) => setUserComment(e.target.value)}
                            placeholder="Add a follow-up comment or provide more information..."
                            rows={4}
                            maxLength={1000}
                            className={cn(
                              "w-full px-4 py-3 border-2 border-foreground bg-background text-foreground font-mono text-sm",
                              "shadow-[4px_4px_0px_0px_var(--color-foreground)]",
                              "focus:outline-none focus:bg-card resize-none",
                            )}
                          />
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-mono text-foreground/60">
                              {userComment.length}/1000
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                submitComment();
                              }}
                              disabled={submittingComment || !userComment.trim()}
                              className={cn(
                                "px-6 py-2 border-2 border-foreground bg-primary text-background font-mono font-bold uppercase text-sm",
                                "shadow-[3px_3px_0px_0px_var(--color-foreground)]",
                                "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_var(--color-foreground)]",
                                "transition-all duration-200",
                                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0",
                              )}
                            >
                              {submittingComment ? "Posting..." : "Post Comment"}
                            </button>
                          </div>
                        </div>
                      )}

                      {ticket.status === "closed" && (
                        <div className="border-2 border-foreground bg-card p-4">
                          <div className="flex items-center gap-2 text-sm font-mono text-foreground/70">
                            <Icon name="lock-closed" className="w-4 h-4" />
                            <span>This ticket is closed and no longer accepts comments.</span>
                          </div>
                        </div>
                      )}
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
