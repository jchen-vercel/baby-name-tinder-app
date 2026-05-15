"use client";

import { useAuth } from "@clerk/nextjs";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  isTextUIPart,
  isToolUIPart,
  type UIMessage,
} from "ai";
import { useCallback, useEffect, useRef, useState } from "react";

const STARTERS = [
  "What does Emma mean, and where is it from?",
  "Suggest classic girl names under 6 letters",
  "Recommend boy names with Hebrew origins we haven’t swiped yet",
] as const;

function ChatBubbleIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

function MessageContent({ message }: { message: UIMessage }) {
  return (
    <div className="space-y-2">
      {message.parts.map((part, i) => {
        if (isTextUIPart(part)) {
          return (
            <div
              key={`${message.id}-text-${i}`}
              className={`whitespace-pre-wrap break-words ${
                message.role === "user"
                  ? "text-foreground"
                  : "text-foreground-muted"
              }`}
            >
              {part.text}
              {part.state === "streaming" ? (
                <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-accent align-middle" />
              ) : null}
            </div>
          );
        }

        if (isToolUIPart(part)) {
          const toolLabel = part.type.replace(/^tool-/, "");
          if (
            part.state === "output-available" ||
            part.state === "output-error"
          ) {
            return null;
          }
          return (
            <p
              key={`${message.id}-tool-${i}`}
              className="text-xs font-mono uppercase tracking-wider text-foreground-subtle"
            >
              Using {toolLabel}…
            </p>
          );
        }

        return null;
      })}
    </div>
  );
}

export function NameChatAssistant() {
  const { isSignedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const listEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, stop, regenerate, error, clearError } =
    useChat({
      transport: new DefaultChatTransport({
        api: "/api/name-chat",
      }),
    });

  const busy = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (open && messages.length > 0) {
      listEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, status]);

  const scrollToBottom = useCallback(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const onSubmit = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) {
        return;
      }
      clearError();
      setDraft("");
      await sendMessage({ text: trimmed });
      requestAnimationFrame(scrollToBottom);
    },
    [busy, clearError, scrollToBottom, sendMessage],
  );

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-end p-4 md:p-6">
      <div className="pointer-events-auto flex flex-col items-end gap-3">
        {open ? (
          <section
            className="flex max-h-[min(70vh,520px)] w-[min(100vw-2rem,400px)] flex-col overflow-hidden rounded-2xl border border-border-default bg-background-base/95 shadow-[0_24px_64px_rgba(0,0,0,0.55)] backdrop-blur-xl"
            aria-label="Name assistant chat"
          >
            <header className="flex items-center justify-between border-b border-border-default px-4 py-3">
              <div>
                <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-accent">
                  Name assistant
                </p>
                <p className="text-sm font-semibold text-foreground">
                  Ask about names
                </p>
              </div>
              <div className="flex items-center gap-1">
                {busy ? (
                  <button
                    type="button"
                    onClick={() => void stop()}
                    className="focus-ring-accent rounded-lg px-2 py-1.5 text-xs font-medium text-foreground-muted hover:text-foreground"
                  >
                    Stop
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                  }}
                  className="focus-ring-accent rounded-lg p-2 text-foreground-muted hover:bg-surface hover:text-foreground"
                  aria-label="Close chat"
                >
                  <span aria-hidden className="text-lg leading-none">
                    ×
                  </span>
                </button>
              </div>
            </header>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {messages.length === 0 ? (
                <p className="text-sm text-foreground-muted">
                  Try one of the prompts below, or ask anything about names in
                  your deck.
                </p>
              ) : null}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-xl px-3 py-2 text-sm ${
                    message.role === "user"
                      ? "ml-6 bg-accent/15 text-left"
                      : "mr-6 border border-white/10 bg-surface/80"
                  }`}
                >
                  <MessageContent message={message} />
                </div>
              ))}

              {error ? (
                <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-100">
                  {error.message}
                  <button
                    type="button"
                    className="focus-ring-accent ml-2 underline"
                    onClick={() => clearError()}
                  >
                    Dismiss
                  </button>
                </div>
              ) : null}

              <div ref={listEndRef} />
            </div>

            {messages.length === 0 ? (
              <div className="flex flex-wrap gap-2 border-t border-border-default px-4 py-3">
                {STARTERS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={busy}
                    onClick={() => void onSubmit(prompt)}
                    className="focus-ring-accent rounded-full border border-border-accent bg-accent/10 px-3 py-1.5 text-left text-xs font-medium text-foreground transition-colors hover:bg-accent/20 disabled:opacity-45"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : null}

            <footer className="border-t border-border-default p-3">
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  void onSubmit(draft);
                }}
              >
                <label className="sr-only" htmlFor="name-chat-input">
                  Message
                </label>
                <input
                  id="name-chat-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Ask about names…"
                  disabled={busy}
                  className="focus-ring-accent min-w-0 flex-1 rounded-xl border border-border-default bg-surface px-3 py-2 text-sm text-foreground placeholder:text-foreground-subtle disabled:opacity-50"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={busy || !draft.trim()}
                  className="btn-primary focus-ring-accent shrink-0 rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-45"
                >
                  Send
                </button>
              </form>
              {messages.some((m) => m.role === "assistant") && !busy ? (
                <button
                  type="button"
                  onClick={() => void regenerate()}
                  className="focus-ring-accent mt-2 text-xs font-medium text-accent hover:text-accent-bright"
                >
                  Regenerate last reply
                </button>
              ) : null}
            </footer>
          </section>
        ) : null}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="focus-ring-accent flex h-14 w-14 items-center justify-center rounded-full border border-border-accent bg-accent text-white shadow-[0_8px_32px_rgba(94,106,210,0.35)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
          aria-expanded={open}
          aria-label={open ? "Close name assistant" : "Open name assistant"}
        >
          <ChatBubbleIcon />
        </button>
      </div>
    </div>
  );
}
