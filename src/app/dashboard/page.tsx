import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-blue mb-2">
        Bienvenido(a), {session?.user?.name}
      </h1>
      <p className="text-gray-600 mb-8">
        Sistema de Gestión Integral de Servicios Automotrices
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats or Shortcuts could go here */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-bold text-lg mb-2 text-brand-black">Módulo de Clientes</h3>
          <p className="text-sm text-gray-500">Registra y administra la información de clientes y sus vehículos.</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-bold text-lg mb-2 text-brand-black">Servicios Realizados</h3>
          <p className="text-sm text-gray-500">Documenta los servicios realizados a cada vehículo con su valor total.</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-bold text-lg mb-2 text-brand-black">Citas Programadas</h3>
          <p className="text-sm text-gray-500">Visualiza y gestiona las citas pendientes del día.</p>
        </div>
      </div>
    </div>
  );
}
