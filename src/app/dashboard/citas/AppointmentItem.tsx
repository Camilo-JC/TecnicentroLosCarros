"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { updateAppointmentStatus } from "./actions";
import { useTransition } from "react";

export default function AppointmentItem({ appointment, isHistory = false }: { appointment: any, isHistory?: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (status: string) => {
    startTransition(() => {
      updateAppointmentStatus(appointment.id, status);
    });
  };

  return (
    <div className="py-3 flex items-center justify-between">
      <div>
        <p className="font-bold text-brand-black">
          {format(new Date(appointment.scheduledDate), "d 'de' MMMM yyyy", { locale: es })} a las {appointment.scheduledTime}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium text-brand-blue">{appointment.vehicle.plate}</span> - {appointment.client.firstName} {appointment.client.lastName}
        </p>
      </div>
      
      {!isHistory ? (
        <div className="flex gap-2">
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
  );
}
