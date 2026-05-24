"use client";

import QRCode from "qrcode";
import { useCallback, useEffect, useMemo, useState } from "react";

function buildInviteUrl(inviteCode: string) {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/onboarding?code=${encodeURIComponent(inviteCode)}`;
}

export function InviteSharePanel({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);

  const inviteUrl = useMemo(
    () => buildInviteUrl(inviteCode),
    [inviteCode],
  );

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [inviteUrl]);

  useEffect(() => {
    if (!showQr) {
      return;
    }

    let cancelled = false;

    void QRCode.toDataURL(inviteUrl, {
      margin: 2,
      width: 220,
      color: { dark: "#EDEDEF", light: "#050506" },
    })
      .then((url) => {
        if (!cancelled) {
          setQrDataUrl(url);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrError("Unable to generate QR code.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [showQr, inviteUrl]);

  return (
    <div className="rounded-2xl border border-border-accent bg-accent/5 px-5 py-4 shadow-[0_0_30px_rgba(94,106,210,0.08)]">
      <p className="font-mono text-xs font-medium uppercase tracking-widest text-foreground-subtle">
        Invite code
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-[0.18em] text-foreground">
        {inviteCode}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void copyLink()}
          className="btn-primary focus-ring-accent rounded-lg px-4 py-2 text-sm font-semibold"
        >
          {copied ? "Copied!" : "Copy invite link"}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowQr((open) => !open);
            setQrDataUrl(null);
            setQrError(null);
          }}
          className="btn-secondary focus-ring-accent rounded-lg px-4 py-2 text-sm font-semibold"
        >
          {showQr ? "Hide QR" : "Show QR"}
        </button>
      </div>

      {showQr ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-border-default bg-surface/60 p-4">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt={`QR code for invite link to couple ${inviteCode}`}
              width={220}
              height={220}
              className="rounded-lg"
            />
          ) : qrError ? (
            <p className="text-sm text-red-200">{qrError}</p>
          ) : (
            <p className="text-sm text-foreground-muted">Generating QR…</p>
          )}
          <p className="max-w-full break-all text-center text-xs text-foreground-muted">
            {inviteUrl}
          </p>
        </div>
      ) : null}
    </div>
  );
}
