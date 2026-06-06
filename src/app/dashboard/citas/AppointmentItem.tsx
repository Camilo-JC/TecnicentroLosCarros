"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { updateAppointmentStatus, rescheduleAppointment } from "./actions";
import { useTransition, useState } from "react";
import { CalendarDays, Clock, Wrench } from "lucide-react";

export default function AppointmentItem({ appointment, isHistory = false }: { appointment: any, isHistory?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [isRescheduling, setIsRescheduling] = useState(false);
  
  const [newDate, setNewDate] = useState(new Date(appointment.scheduledDate).toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState(appointment.scheduledTime); // "MAÑANA" o "TARDE"

  const todayDate = new Date().toISOString().split('T')[0];
  const jornadaTexto = appointment.scheduledTime === "MAÑANA" ? "Mañana (8:00 AM - 12:00 PM)" : "Tarde (12:00 PM - 5:00 PM)";
  const serviciosTexto = appointment.services?.map((s: any) => s.name).join(", ") || "Ninguno";

  const handleStatusChange = (status: string) => {
    startTransition(() => {
      updateAppointmentStatus(appointment.id, status);
    });
  };

  const handleSendReminder = () => {
    let phone = appointment.client.phone.replace(/\D/g, '');
    if (phone.length === 10) phone = `57${phone}`;

    const fechaFormateada = format(new Date(appointment.scheduledDate), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
    const portalUrl = `${window.location.origin}/portal/vehiculo/${appointment.vehicle.token}`;

    const message = `¡Hola, *${appointment.client.firstName}*! 🚗\n\nTe recordamos que hoy tienes programada una cita de servicio automotriz con nosotros en *Tecnicentro Los Carros*:\n\n` +
      `• *Vehículo:* ${appointment.vehicle.plate} (${appointment.vehicle.brand} ${appointment.vehicle.model || ''})\n` +
      `• *Jornada:* ${appointment.scheduledTime === "MAÑANA" ? "Mañana" : "Tarde"}\n` +
      `• *Servicios:* ${serviciosTexto}\n\n` +
      `Por favor, confirmanos si asistirás o si necesitas reprogramarla ingresando al portal de autogestión:\n🔗 ${portalUrl}\n\n` +
      `¡Te esperamos!\n_Tecnicentro Los Carros_`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleReschedule = () => {
    startTransition(async () => {
      const result = await rescheduleAppointment(appointment.id, newDate, newTime);
      if (result.success && result.whatsappUrl) {
        window.open(result.whatsappUrl, "_blank");
      }
      setIsRescheduling(false);
    });
  };

  return (
    <div className="py-4 flex flex-col gap-3 border-b border-gray-100 last:border-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="font-bold text-brand-black text-base flex items-center gap-1.5 flex-wrap">
            <span className="text-brand-blue">
              {format(new Date(appointment.scheduledDate), "d 'de' MMMM yyyy", { locale: es })}
            </span>
            <span className="text-gray-400">|</span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold">
              Jornada: {appointment.scheduledTime === "MAÑANA" ? "Mañana" : "Tarde"}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-bold text-brand-black">{appointment.vehicle.plate}</span> - {appointment.vehicle.brand} {appointment.vehicle.model || ''}
            <span className="text-gray-400 mx-1.5">•</span> Propietario: <span className="font-medium">{appointment.client.firstName} {appointment.client.lastName}</span>
          </p>
          {appointment.services && appointment.services.length > 0 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-brand-blue font-medium bg-blue-50/50 border border-blue-100/50 px-2.5 py-1 rounded-lg w-fit">
              <Wrench className="w-3 h-3" />
              <span>Servicios: {serviciosTexto}</span>
            </div>
          )}
        </div>
        
        {!isHistory ? (
          <div className="flex flex-wrap gap-2 justify-start sm:justify-end items-center">
            <button 
              onClick={handleSendReminder}
              className="text-xs bg-brand-yellow text-brand-black px-3 py-1.5 rounded-lg hover:bg-yellow-400 transition-colors font-bold shadow-xs"
            >
              Recordar
            </button>
            <button 
              onClick={() => setIsRescheduling(!isRescheduling)}
              className="text-xs bg-blue-50 text-brand-blue px-3 py-1.5 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors font-bold"
            >
              Reprogramar
            </button>
            <button 
              onClick={() => handleStatusChange('COMPLETED')}
              disabled={isPending}
              className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 border border-green-200 transition-colors font-bold disabled:opacity-50"
            >
              Completar
            </button>
            <button 
              onClick={() => handleStatusChange('CANCELLED')}
              disabled={isPending}
              className="text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-100 border border-red-200 transition-colors font-bold disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div>
            <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border ${appointment.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {appointment.status === 'COMPLETED' ? 'Completada' : 'Cancelada'}
            </span>
          </div>
        )}
      </div>

      {isRescheduling && !isHistory && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-wrap gap-4 items-end animate-in slide-in-from-top-2 duration-200">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-brand-blue" /> Nueva Fecha
            </label>
            <input 
              type="date" 
              min={todayDate}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-white p-2 text-sm outline-none border text-gray-900" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-blue" /> Nueva Jornada
            </label>
            <select 
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-white p-2 text-sm outline-none border text-gray-900"
            >
              <option value="MAÑANA">Mañana</option>
              <option value="TARDE">Tarde</option>
            </select>
          </div>
          <button 
            onClick={handleReschedule}
            disabled={isPending}
            className="text-xs bg-brand-blue text-white px-4 py-2.5 rounded-lg hover:bg-blue-800 transition-colors font-bold disabled:opacity-50 shadow-sm"
          >
            {isPending ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      )}
    </div>
  );
}
