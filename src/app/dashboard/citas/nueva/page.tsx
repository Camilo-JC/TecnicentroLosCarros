import AppointmentForm from "./AppointmentForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function NuevaCitaPage() {
  const services = await prisma.maintenanceService.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link 
          href="/dashboard/citas" 
          className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-brand-blue mb-1">Agendar Cita</h1>
          <p className="text-gray-600">Busca el vehículo y selecciona la fecha de atención.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <AppointmentForm services={services} />
      </div>
    </div>
  );
}
