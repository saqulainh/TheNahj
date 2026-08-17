"use client";

/**
 * useStreamingResponse
 *
 * Reusable React hook for consuming SSE streams from the TheNahj AI chat API.
 *
 * Features:
 * - Connects to the /api/ai/chat endpoint using fetch + ReadableStream
 * - Accumulates text tokens from "token" events into `displayedText` state
 * - Exposes pipeline stage messages from "status" events as `statusMessage`
 * - Provides `skipToEnd()` to instantly reveal the full text
 * - Auto-scrolls a provided container ref as new text arrives
 * - Gracefully falls back to a full text dump if the SSE stream fails
 * - Returns `metadata` (widget, relatedWisdom, topics) from the "done" event
 *
 * Usage:
 *   const { displayedText, isStreaming, statusMessage, skipToEnd, metadata } =
 *     useStreamingResponse({ scrollRef: messagesEndRef });
 *
 *   // To send a message:
 *   await sendMessage({ message: text, history: [...] });
 */

import { useState, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StreamMetadata {
  topics?: string[];
  widget?: any;
  relatedWisdom?: Array<{ title: string; slug: string; quote: string; category?: string }>;
  cached?: boolean;
}

export interface SendMessagePayload {
  message: string;
  history: Array<{ role: string; content: string }>;
}

export interface StreamingResponseState {
  /** Text accumulated so far (or full text after stream ends / skipToEnd) */
  displayedText: string;
  /** True while the SSE connection is open and tokens are arriving */
  isStreaming: boolean;
  /** Current pipeline stage message, e.g. "Searching Nahjul Balagha..." */
  statusMessage: string;
  /** Metadata received in the "done" event */
  metadata: StreamMetadata | null;
  /** Error message if the stream failed */
  error: string | null;
  /** Call this to instantly reveal the full text without waiting for animation */
  skipToEnd: () => void;
  /** Send a new message to the API and start streaming the response */
  sendMessage: (payload: SendMessagePayload) => Promise<void>;
}

// ─── Status message copy ──────────────────────────────────────────────────────
const STAGE_MESSAGES: Record<string, string> = {
  cache_check:  "Checking wisdom archive...",
  retrieving:   "Searching Nahjul Balagha...",
  composing:    "Composing response...",
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStreamingResponse(options?: {
  /** A ref to a DOM element that should be scrolled into view as text arrives */
  scrollRef?: React.RefObject<HTMLElement | null>;
  /** Endpoint to POST to (defaults to /api/ai/chat) */
  endpoint?: string;
}): StreamingResponseState {
  const endpoint = options?.endpoint ?? "/api/ai/chat";
  const scrollRef = options?.scrollRef;

  const [displayedText, setDisplayedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [metadata, setMetadata] = useState<StreamMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Internal: full accumulated text (not just what's displayed)
  const fullTextRef = useRef("");
  // Flag: user pressed skip
  const skippedRef = useRef(false);
  // AbortController for the current fetch
  const abortRef = useRef<AbortController | null>(null);

  /** Scroll the container end into view smoothly */
  const scrollToBottom = useCallback(() => {
    scrollRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [scrollRef]);

  /** Instantly reveal all accumulated text */
  const skipToEnd = useCallback(() => {
    skippedRef.current = true;
    setDisplayedText(fullTextRef.current);
    scrollToBottom();
  }, [scrollToBottom]);

  const sendMessage = useCallback(
    async (payload: SendMessagePayload): Promise<void> => {
      // Cancel any in-progress stream
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Reset state
      fullTextRef.current = "";
      skippedRef.current = false;
      setDisplayedText("");
      setStatusMessage("Searching Nahjul Balagha...");
      setMetadata(null);
      setError(null);
      setIsStreaming(true);

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        // ── Non-SSE fallback (no streaming / error response) ────────────────
        if (!res.ok || !res.body || res.headers.get("content-type")?.includes("application/json")) {
          const data = await res.json().catch(() => ({}));
          if (data.reply) {
            fullTextRef.current = data.reply;
            setDisplayedText(data.reply);
            setMetadata({
              topics: data.topics,
              widget: data.widget,
              relatedWisdom: data.relatedWisdom,
            });
          } else {
            setError(data.error || "Failed to get a response.");
          }
          setIsStreaming(false);
          return;
        }

        // ── SSE stream reading ──────────────────────────────────────────────
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let currentEvent = ""; // tracks the current SSE event type

        const processLine = (line: string) => {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
            return;
          }

          if (!line.startsWith("data: ")) {
            if (line === "") currentEvent = ""; // blank line resets event
            return;
          }

          const jsonStr = line.slice(6).trim();
          if (!jsonStr) return;

          let parsed: any;
          try {
            parsed = JSON.parse(jsonStr);
          } catch {
            return;
          }

          // Route by explicit event type (preferred) or payload shape (fallback)
          const evt = currentEvent || (
            "stage" in parsed ? "status" :
            "text"  in parsed ? "token"  :
            ("topics" in parsed || "cached" in parsed) ? "done" :
            ("message" in parsed && Object.keys(parsed).length === 1) ? "error" : ""
          );

          if (evt === "status") {
            const msg = STAGE_MESSAGES[parsed.stage] ?? parsed.message ?? "";
            setStatusMessage(msg);
          } else if (evt === "token") {
            fullTextRef.current += parsed.text;
            if (!skippedRef.current) {
              setDisplayedText(fullTextRef.current);
              scrollToBottom();
            }
          } else if (evt === "done") {
            setMetadata({
              topics: parsed.topics,
              widget: parsed.widget,
              relatedWisdom: parsed.relatedWisdom,
              cached: parsed.cached,
            });
            // Ensure full text is shown
            setDisplayedText(fullTextRef.current);
            setStatusMessage("");
          } else if (evt === "error") {
            setError(parsed.message);
          }
        };

        const processBuffer = () => {
          const lines = buffer.split("\n");
          // Keep last potentially incomplete line in buffer
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            processLine(line.trim());
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          processBuffer();
        }

        // Process any remaining data in buffer
        if (buffer.trim()) {
          for (const line of buffer.split("\n")) {
            processLine(line.trim());
          }
        }

        // Final scroll
        scrollToBottom();
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("[useStreamingResponse] Error:", err);
          setError("Connection error. Please check your network and try again.");
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [endpoint, scrollToBottom]
  );

  return {
    displayedText,
    isStreaming,
    statusMessage,
    metadata,
    error,
    skipToEnd,
    sendMessage,
  };
}
