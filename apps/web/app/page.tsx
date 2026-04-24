import { SiteShell } from "@/components/site-shell";
import { RoleOverview } from "@/components/dashboard/role-overview";
import { WalletConnect } from "@/components/WalletConnect";

export default function Home() {
  return (
    <SiteShell
      eyebrow="Stellar Freelance Infrastructure"
      title="Premium freelance execution with escrow, verifiable reputation, and transparent AI arbitration."
      description="Lance is the surface layer for serious clients and elite independents who want payment security, immutable trust signals, and fast dispute resolution without losing clarity."
    >
      <div className="mb-8 flex justify-center">
        <WalletConnect />
      </div>
      <RoleOverview />
    </SiteShell>
  );
}
