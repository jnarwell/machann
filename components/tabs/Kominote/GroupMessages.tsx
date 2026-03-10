"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: {
    id: string;
    name: string;
    initials: string;
    avatarColor: string;
  };
}

export default function GroupMessages() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [lastTimestamp, setLastTimestamp] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Demo user ID for checking ownership
  const DEMO_USER_ID = "demo-user-1";

  const fetchMessages = useCallback(async (after?: string | null) => {
    try {
      const url = after
        ? `/api/messages?after=${encodeURIComponent(after)}`
        : "/api/messages";
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (after && data.messages.length > 0) {
          // Append new messages
          setMessages((prev) => [...prev, ...data.messages]);
        } else if (!after) {
          // Initial load
          setMessages(data.messages);
        }
        setLastTimestamp(data.latestTimestamp);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Polling for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastTimestamp) {
        fetchMessages(lastTimestamp);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [lastTimestamp, fetchMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      if (response.ok) {
        const message = await response.json();
        setMessages((prev) => [...prev, message]);
        setNewMessage("");
        setLastTimestamp(message.timestamp);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/messages?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(language === "kr" ? "fr-HT" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="card p-4">
      <h3 className="font-display text-lg font-semibold text-indigo mb-4">
        {t("kominote.messages")}
      </h3>

      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
        {messages.length === 0 ? (
          <p className="text-center text-indigo/50 py-4">
            {language === "kr" ? "Pa gen mesaj anko" : "No messages yet"}
          </p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex gap-3 group">
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-parchment font-display text-xs font-bold"
                style={{ backgroundColor: message.sender.avatarColor || "#6B7C5E" }}
              >
                {message.sender.initials}
              </div>

              {/* Message content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-semibold text-sm text-indigo">
                    {message.sender.name}
                  </span>
                  <span className="text-xs text-indigo/40">
                    {formatTime(message.timestamp)}
                  </span>
                  {/* Delete button - only show for own messages */}
                  {message.sender.id === DEMO_USER_ID && (
                    <button
                      onClick={() => handleDelete(message.id)}
                      disabled={deletingId === message.id}
                      className="text-xs text-indigo/30 hover:text-alert-red opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      title={language === "kr" ? "Efase" : "Delete"}
                    >
                      {deletingId === message.id ? "\u21BB" : "\u2717"}
                    </button>
                  )}
                </div>
                <p className="text-sm text-indigo/80 mt-0.5 break-words">
                  {message.content}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="mt-4 pt-3 border-t border-parchment-dark/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              language === "kr" ? "Ekri yon mesaj..." : "Write a message..."
            }
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-parchment-dark bg-parchment-light text-indigo placeholder:text-indigo/40"
            disabled={isSending}
          />
          <button
            onClick={handleSend}
            disabled={isSending || !newMessage.trim()}
            className="px-4 py-2 bg-terracotta text-parchment rounded-lg text-sm font-display hover:bg-terracotta-600 transition-colors disabled:opacity-50"
          >
            {isSending
              ? "..."
              : language === "kr"
              ? "Voye"
              : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
