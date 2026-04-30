import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Car, LogOut, Users, Wrench, CalendarDays } from "lucide-react";
import LogoutButton from "./LogoutButton";
import PageTransition from "@/components/PageTransition";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-blue text-white flex flex-col fixed h-full shadow-xl">
        <div className="p-4 bg-brand-yellow flex justify-center items-center">
          <div className="relative w-48 h-16">
            <Image
              src="/logo.tlc.png"
              alt="Tecnicentro Los Carros Logo"
              fill
              className="object-contain drop-shadow-md"
              priority
            />
          </div>
        </div>
        
        <div className="p-4 border-b border-blue-800">
          <p className="text-xs text-blue-300 uppercase font-bold tracking-wider mb-1">
            Operador Actual
          </p>
          <p className="font-medium">{session.user?.name}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-800 transition-colors">
            <Car className="w-5 h-5 text-brand-yellow" />
            <span className="font-medium">Inicio</span>
          </Link>
          <Link href="/dashboard/clientes" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-800 transition-colors">
            <Users className="w-5 h-5 text-brand-yellow" />
            <span className="font-medium">Clientes y Vehículos</span>
          </Link>
          <Link href="/dashboard/servicios" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-800 transition-colors">
            <Wrench className="w-5 h-5 text-brand-yellow" />
            <span className="font-medium">Servicios</span>
          </Link>
          <Link href="/dashboard/citas" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-800 transition-colors">
            <CalendarDays className="w-5 h-5 text-brand-yellow" />
            <span className="font-medium">Agendamiento</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-blue-800">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main
        className="relative flex-1 ml-64 p-8"
        style={{
          backgroundImage: "url('/fondo%20tlc.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay claro */}
        <div className="absolute inset-0 bg-white/85" />
        <div className="relative z-10">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>
    </div>
  );
}
