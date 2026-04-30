import { getAppointments } from "./actions";
import Link from "next/link";
import { PlusCircle, CalendarDays, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import AppointmentItem from "./AppointmentItem";

export default async function CitasPage() {
  const appointments = await getAppointments();

  const pending = appointments.filter(a => a.status === 'PENDING');
  const completed = appointments.filter(a => a.status !== 'PENDING');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-blue mb-2">Agendamiento de Citas</h1>
          <p className="text-gray-600">Visualiza y administra las citas programadas.</p>
        </div>
        <Link 
          href="/dashboard/citas/nueva" 
          className="flex items-center gap-2 bg-brand-yellow hover:bg-yellow-400 text-brand-black font-bold py-2 px-4 rounded-lg transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          Agendar Cita
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pendientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-blue-50 p-4 border-b border-blue-100">
            <h2 className="font-bold text-brand-blue flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Citas Pendientes
            </h2>
          </div>
          <div className="p-4 divide-y divide-gray-100">
            {pending.length > 0 ? (
              pending.map(appt => (
                <AppointmentItem key={appt.id} appointment={appt} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No hay citas pendientes.</p>
            )}
          </div>
        </div>

        {/* Historial / Completadas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden opacity-80">
          <div className="bg-gray-50 p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-700 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Historial de Citas
            </h2>
          </div>
          <div className="p-4 divide-y divide-gray-100">
            {completed.length > 0 ? (
              completed.map(appt => (
                <AppointmentItem key={appt.id} appointment={appt} isHistory />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No hay historial registrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
