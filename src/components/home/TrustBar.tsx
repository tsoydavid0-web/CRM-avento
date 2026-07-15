import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

const richTags = {
  b: (chunks: ReactNode) => <b>{chunks}</b>,
  // AMI number is a placeholder until the real licence is provided.
  tag: (chunks: ReactNode) => <span className="placeholder-tag">{chunks}</span>,
};

export function TrustBar() {
  const t = useTranslations("Trust");
  const keys = ["ami", "porto", "turnkey", "transparent"] as const;

  return (
    <div className="trust">
      <div className="wrap trust-in">
        {keys.map((key) => (
          <span key={key}>
            <span className="dot">◆</span> {t.rich(key, richTags)}
          </span>
        ))}
      </div>
    </div>
  );
}
