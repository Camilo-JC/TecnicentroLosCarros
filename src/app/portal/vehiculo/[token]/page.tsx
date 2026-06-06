import { getPortalData } from "../../actions";
import PortalClientView from "./PortalClientView";
import { notFound } from "next/navigation";

export default async function PortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getPortalData(token);

  if (!data) {
    notFound();
  }

  return (
    <div
      className="min-h-screen bg-slate-50 relative p-4 md:p-8 flex flex-col items-center"
      style={{
        backgroundImage: "url('/fondo%20tlc.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay claro para asegurar legibilidad */}
      <div className="absolute inset-0 bg-white/90 z-0" />
      
      <div className="relative z-10 w-full max-w-3xl flex-1 flex flex-col gap-6">
        <PortalClientView 
          vehicle={data.vehicle} 
          activeServices={data.activeServices} 
          token={token} 
        />
      </div>
    </div>
  );
}
