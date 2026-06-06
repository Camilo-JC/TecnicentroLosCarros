"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Car, 
  User, 
  CalendarDays, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  AlertCircle, 
  X,
  History,
  Trash2,
  Edit2
} from "lucide-react";
import { 
  portalCreateAppointment, 
  portalRescheduleAppointment, 
  portalCancelAppointment 
} from "../../actions";

interface PortalClientViewProps {
  vehicle: any;
  activeServices: any[];
  token: string;
}

export default function PortalClientView({ vehicle, activeServices, token }: PortalClientViewProps) {
  const [activeTab, setActiveTab] = useState<"citas" | "historial">("citas");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states for new appointment
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState(""); // "MAÑANA" o "TARDE"
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Rescheduling state
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const todayDate = new Date().toISOString().split('T')[0];

  const handleServiceCheckbox = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedServices(prev => [...prev, id]);
    } else {
      setSelectedServices(prev => prev.filter(sId => sId !== id));
    }
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedDate || !selectedTime) {
      setError("Por favor selecciona la fecha y la jornada.");
      return;
    }

    if (selectedServices.length === 0) {
      setError("Debes seleccionar al menos un servicio de mantenimiento.");
      return;
    }

    startTransition(async () => {
      const result = await portalCreateAppointment(token, selectedDate, selectedTime, selectedServices);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Tu solicitud de cita ha sido registrada y confirmada exitosamente.");
        setSelectedDate("");
        setSelectedTime("");
        setSelectedServices([]);
        // Recargar página para actualizar estado
        window.location.reload();
      }
    });
  };

  const handleReschedule = (appointmentId: string) => {
    setError(null);
    setSuccess(null);

    if (!newDate || !newTime) {
      setError("Por favor selecciona la nueva fecha y jornada.");
      return;
    }

    startTransition(async () => {
      const result = await portalRescheduleAppointment(appointmentId, token, newDate, newTime);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Tu cita ha sido reprogramada con éxito.");
        setReschedulingId(null);
        setNewDate("");
        setNewTime("");
        window.location.reload();
      }
    });
  };

  const handleCancel = (appointmentId: string) => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta cita?")) return;
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await portalCancelAppointment(appointmentId, token);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("La cita ha sido cancelada exitosamente.");
        window.location.reload();
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Logo */}
      <div className="flex flex-col items-center justify-center p-4 bg-brand-yellow rounded-2xl shadow-md border border-yellow-300">
        <div className="relative w-64 h-24">
          <Image
            src="/logo.tlc.png"
            alt="Tecnicentro Los Carros Logo"
            fill
            className="object-contain drop-shadow-sm"
            priority
          />
        </div>
      </div>

      {/* Info Card Propietario & Vehículo */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-brand-blue">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tu Vehículo</h3>
            <p className="font-extrabold text-brand-black text-xl mt-0.5">{vehicle.plate}</p>
            <p className="text-sm text-gray-700 font-medium">{vehicle.brand} {vehicle.model}</p>
            <p className="text-xs text-gray-500 mt-0.5">Año Modelo: {vehicle.modelYear}</p>
          </div>
        </div>

        <div className="flex items-start gap-4 md:border-l md:border-gray-100 md:pl-6">
          <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 text-yellow-600">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Propietario</h3>
            <p className="font-bold text-brand-black text-base mt-0.5">{vehicle.client.firstName} {vehicle.client.lastName}</p>
            <p className="text-sm text-gray-600">{vehicle.client.phone}</p>
            {vehicle.client.address && (
              <p className="text-xs text-gray-500 italic mt-0.5">Dir: {vehicle.client.address}</p>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-medium border border-green-100 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-green-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-xl p-1 shadow-xs border">
        <button
          onClick={() => setActiveTab("citas")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
            activeTab === "citas"
              ? "bg-brand-blue text-white shadow-sm"
              : "text-gray-500 hover:text-gray-800 hover:bg-slate-50"
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Citas y Agendamiento
        </button>
        <button
          onClick={() => setActiveTab("historial")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
            activeTab === "historial"
              ? "bg-brand-blue text-white shadow-sm"
              : "text-gray-500 hover:text-gray-800 hover:bg-slate-50"
          }`}
        >
          <History className="w-4 h-4" />
          Historial de Mantenimientos
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === "citas" && (
          <div className="space-y-6">
            {/* Citas Pendientes */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-brand-blue mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Mis Citas Pendientes
              </h2>

              {vehicle.appointments && vehicle.appointments.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {vehicle.appointments.map((appt: any) => (
                    <div key={appt.id} className="py-4 first:pt-0 last:pb-0 flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-brand-black">
                            {format(new Date(appt.scheduledDate), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="bg-blue-50 text-brand-blue text-xs font-bold px-2 py-0.5 rounded border border-blue-100">
                              Jornada: {appt.scheduledTime === "MAÑANA" ? "Mañana" : "Tarde"}
                            </span>
                            <span className="bg-yellow-50 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded border border-yellow-100">
                              Pendiente
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 font-medium">
                            Servicios: {appt.services.map((s: any) => s.name).join(", ")}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setReschedulingId(appt.id);
                              setNewDate(new Date(appt.scheduledDate).toISOString().split('T')[0]);
                              setNewTime(appt.scheduledTime);
                            }}
                            className="inline-flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold border border-slate-200 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Reprogramar
                          </button>
                          <button
                            onClick={() => handleCancel(appt.id)}
                            className="inline-flex items-center gap-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-bold border border-red-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Cancelar
                          </button>
                        </div>
                      </div>

                      {/* Reprogramar Modal/Form inline */}
                      {reschedulingId === appt.id && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 flex flex-wrap gap-4 items-end mt-2 animate-in slide-in-from-top-2 duration-150">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Nueva Fecha
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
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Nueva Jornada
                            </label>
                            <select 
                              value={newTime}
                              onChange={(e) => setNewTime(e.target.value)}
                              className="rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-white p-2 text-sm outline-none border text-gray-900 font-medium"
                            >
                              <option value="MAÑANA">Mañana</option>
                              <option value="TARDE">Tarde</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleReschedule(appt.id)}
                              disabled={isPending}
                              className="text-xs bg-brand-blue text-white px-4 py-2.5 rounded-lg hover:bg-blue-800 transition-colors font-bold disabled:opacity-50"
                            >
                              {isPending ? 'Guardando...' : 'Confirmar'}
                            </button>
                            <button 
                              onClick={() => setReschedulingId(null)}
                              className="text-xs bg-white text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors font-bold"
                            >
                              Cerrar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm py-2">No tienes citas pendientes para este vehículo.</p>
              )}
            </div>

            {/* Solicitar Nueva Cita */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-brand-blue mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Solicitar Nueva Cita
              </h2>

              <form onSubmit={handleCreateAppointment} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha sugerida *
                    </label>
                    <input 
                      required 
                      type="date" 
                      min={todayDate}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 p-2.5 outline-none border text-gray-950" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jornada *
                    </label>
                    <select 
                      required
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 p-2.5 outline-none border text-gray-950"
                    >
                      <option value="">Selecciona jornada</option>
                      <option value="MAÑANA">Mañana (8:00 AM - 12:00 PM)</option>
                      <option value="TARDE">Tarde (12:00 PM - 5:00 PM)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Servicios requeridos * (Selecciona al menos uno)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeServices.map(service => (
                      <label 
                        key={service.id} 
                        className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-all hover:border-brand-blue/50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service.id)}
                          onChange={(e) => handleServiceCheckbox(service.id, e.target.checked)}
                          className="w-5 h-5 text-brand-blue rounded border-gray-300 focus:ring-brand-blue mt-0.5"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-brand-black text-sm">{service.name}</p>
                          {service.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{service.description}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full sm:w-auto flex justify-center items-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-bold text-brand-black bg-brand-yellow hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow transition-colors disabled:opacity-50"
                  >
                    {isPending ? "Procesando..." : "Solicitar Agendamiento"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "historial" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-brand-blue mb-4 flex items-center gap-2">
              <History className="w-5 h-5" />
              Historial de Servicios
            </h2>

            {vehicle.services && vehicle.services.length > 0 ? (
              <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
                {vehicle.services.map((record: any) => (
                  <div key={record.id} className="relative pl-6">
                    {/* Circle Node */}
                    <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-brand-blue rounded-full ring-4 ring-white" />
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                        <span className="text-sm font-bold text-brand-black">
                          {format(new Date(record.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                        </span>
                        <span className="text-sm font-extrabold text-brand-blue bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-lg">
                          ${record.totalValue.toLocaleString("es-CO")} COP
                        </span>
                      </div>
                      
                      {record.description && (
                        <p className="text-sm text-gray-600 mb-3">{record.description}</p>
                      )}

                      <div className="flex flex-wrap gap-1.5">
                        {record.activities.map((act: any) => (
                          <span 
                            key={act.id} 
                            className="bg-white text-gray-700 px-2 py-1 rounded border border-gray-200 text-xs font-medium"
                          >
                            {act.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm py-4 text-center">Aún no se registran mantenimientos para este vehículo.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
