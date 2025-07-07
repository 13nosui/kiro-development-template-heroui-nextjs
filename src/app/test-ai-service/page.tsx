import { HeroUIShowcase } from "@/components/HeroUIShowcase";
import { ServiceDashboard } from "@/components/ServiceDashboard";

export default function Test-ai-servicePage() {
  return (
    <main className="min-h-screen bg-nidomi-surface">
      <div className="container mx-auto p-6">
        <h1 className="text-large font-bold text-nidomi-primary mb-6">
          Test-ai-service Service
        </h1>
        <ServiceDashboard serviceName="test-ai-service" />
        <HeroUIShowcase />
      </div>
    </main>
  );
}