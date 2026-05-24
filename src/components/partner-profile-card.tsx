import type { PartnerProfile } from "@/lib/partner-profile";

function formatPartnerName(partner: PartnerProfile) {
  const parts = [partner.firstName, partner.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Your partner";
}

export function PartnerProfileCard({ partner }: { partner: PartnerProfile }) {
  const fullName = formatPartnerName(partner);

  return (
    <div className="surface-card surface-card-glass flex items-center gap-4 rounded-2xl p-4 md:min-w-[240px] md:p-5">
      <img
        src={partner.imageUrl}
        alt=""
        className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-white/10"
      />
      <div className="min-w-0">
        <p className="font-mono text-xs font-medium uppercase tracking-widest text-accent">
          Your partner
        </p>
        <p className="mt-1 truncate text-lg font-semibold tracking-tight text-foreground">
          {fullName}
        </p>
      </div>
    </div>
  );
}
