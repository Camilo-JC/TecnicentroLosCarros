import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Car, LogOut, Users, Wrench, CalendarDays } from "lucide-react";
import LogoutButton from "./LogoutButton";

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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-blue text-white flex flex-col fixed h-full">
        <div className="p-4 bg-brand-yellow text-brand-black">
          <h1 className="font-black text-xl tracking-tighter uppercase leading-tight">
            Tecnicentro
            <br />
            Los Carros
          </h1>
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
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
