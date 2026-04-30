import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Bell } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Get today's start and end
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaysAppointments = await prisma.appointment.findMany({
    where: {
      scheduledDate: {
        gte: today,
        lt: tomorrow,
      },
      status: 'PENDING'
    },
    include: {
      client: true,
      vehicle: true
    },
    orderBy: { scheduledTime: 'asc' }
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-blue mb-2">
        Bienvenido(a), {session?.user?.name}
      </h1>
      <p className="text-gray-600 mb-8">
        Sistema de Gestión Integral de Servicios Automotrices
      </p>

      {/* Alertas del Día */}
      {todaysAppointments.length > 0 && (
        <div className="mb-8 bg-blue-50 border-l-4 border-brand-blue p-4 rounded-r-xl shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-brand-blue animate-pulse" />
            <h2 className="text-lg font-bold text-brand-blue">
              Tienes {todaysAppointments.length} {todaysAppointments.length === 1 ? 'cita programada' : 'citas programadas'} para hoy
            </h2>
          </div>
          <div className="space-y-2">
            {todaysAppointments.map(appt => (
              <div key={appt.id} className="bg-white p-3 rounded-lg border border-blue-100 flex justify-between items-center">
                <div>
                  <span className="font-bold text-brand-black">{appt.scheduledTime}</span> - <span className="font-medium text-brand-blue">{appt.vehicle.plate}</span> {appt.vehicle.brand}
                  <p className="text-sm text-gray-600">{appt.client.firstName} {appt.client.lastName}</p>
                </div>
                <Link href="/dashboard/citas" className="text-sm text-brand-blue hover:underline font-medium">Ver detalles</Link>
              </div>
            ))}
          </div>
        </div>
      )}

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
