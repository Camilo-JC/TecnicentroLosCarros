"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { updateAppointmentStatus, rescheduleAppointment } from "./actions";
import { useTransition, useState } from "react";
import { CalendarDays, Clock } from "lucide-react";

export default function AppointmentItem({ appointment, isHistory = false }: { appointment: any, isHistory?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [isRescheduling, setIsRescheduling] = useState(false);
  
  const [newDate, setNewDate] = useState(new Date(appointment.scheduledDate).toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState(appointment.scheduledTime);

  const todayDate = new Date().toISOString().split('T')[0];

  const handleStatusChange = (status: string) => {
    startTransition(() => {
      updateAppointmentStatus(appointment.id, status);
    });
  };

  const handleSendReminder = () => {
    let phone = appointment.client.phone.replace(/\D/g, '');
    if (phone.length === 10) phone = `57${phone}`;

    const message = `¡Hola!  Esperamos que estés muy bien. Te recordamos que hoy tienes una cita con nosotros a las ${appointment.scheduledTime}.\nPor favor confírmanos si asistirás o si necesitas reprogramar.\n¡Te esperamos! \n Tecnicentro Los Carros, la mejor decisión para su carro y usted.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleReschedule = () => {
    startTransition(async () => {
      await rescheduleAppointment(appointment.id, newDate, newTime);
      setIsRescheduling(false);
    });
  };

  return (
    <div className="py-3 flex flex-col gap-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-brand-black">
            {format(new Date(appointment.scheduledDate), "d 'de' MMMM yyyy", { locale: es })} a las {appointment.scheduledTime}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-brand-blue">{appointment.vehicle.plate}</span> - {appointment.client.firstName} {appointment.client.lastName}
          </p>
        </div>
        
        {!isHistory ? (
          <div className="flex flex-wrap gap-2 justify-end">
            <button 
              onClick={handleSendReminder}
              className="text-xs bg-brand-yellow text-brand-black px-3 py-1 rounded hover:bg-yellow-400 transition-colors font-bold"
            >
              Recordar
            </button>
            <button 
              onClick={() => setIsRescheduling(!isRescheduling)}
              className="text-xs bg-blue-100 text-brand-blue px-3 py-1 rounded hover:bg-blue-200 transition-colors font-bold"
            >
              Reprogramar
            </button>
            <button 
              onClick={() => handleStatusChange('COMPLETED')}
              disabled={isPending}
              className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors font-bold disabled:opacity-50"
            >
              Completar
            </button>
            <button 
              onClick={() => handleStatusChange('CANCELLED')}
              disabled={isPending}
              className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors font-bold disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div>
            <span className={`text-xs px-2 py-1 rounded font-bold ${appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {appointment.status === 'COMPLETED' ? 'Completada' : 'Cancelada'}
            </span>
          </div>
        )}
      </div>

      {isRescheduling && !isHistory && (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              <CalendarDays className="w-3 h-3" /> Nueva Fecha
            </label>
            <input 
              type="date" 
              min={todayDate}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="rounded border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-white p-1.5 text-sm outline-none border" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Nueva Hora
            </label>
            <input 
              type="time" 
              min="08:00"
              max="17:00"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="rounded border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-white p-1.5 text-sm outline-none border" 
            />
          </div>
          <button 
            onClick={handleReschedule}
            disabled={isPending}
            className="text-xs bg-brand-blue text-white px-3 py-2 rounded hover:bg-blue-800 transition-colors font-bold disabled:opacity-50"
          >
            {isPending ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      )}
    </div>
  );
}
