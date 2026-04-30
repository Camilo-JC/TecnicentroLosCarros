"use client";

import { useTransition, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAppointment } from "../actions";
import { searchVehiclesByPlate } from "../../servicios/actions";
import { Save, Search, Car, CalendarDays, Clock } from "lucide-react";

export default function AppointmentForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [plateQuery, setPlateQuery] = useState("");
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const todayDate = new Date().toISOString().split('T')[0];

  const handleSearchVehicle = async (query: string) => {
    if (!query) {
      setVehicles([]);
      return;
    }
    const results = await searchVehiclesByPlate(query);
    setVehicles(results);
    setSelectedVehicle(null);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearchVehicle(plateQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [plateQuery]);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    if (!selectedVehicle) {
      setError("Debes seleccionar un vehículo primero.");
      return;
    }

    formData.append("vehicleId", selectedVehicle.id);
    formData.append("clientId", selectedVehicle.clientId);
    formData.append("notifyEmail", notifyEmail ? "true" : "false");
    formData.append("notifyWhatsapp", notifyWhatsapp ? "true" : "false");

    startTransition(async () => {
      const result = await createAppointment(formData);
      if (result.error) {
        setError(result.error);
      } else {
        if (result.whatsappUrl) {
          window.open(result.whatsappUrl, "_blank");
        }
        router.push("/dashboard/citas");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Buscador de Vehículo */}
      {!selectedVehicle && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Vehículo por Placa</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={plateQuery}
                onChange={(e) => setPlateQuery(e.target.value)}
                className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-white p-2.5 outline-none border uppercase"
                placeholder="ABC-123 o Cédula..."
              />
            </div>
          </div>

          {vehicles.length > 0 && (
            <div className="mt-4 grid gap-2">
              {vehicles.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicle(v)}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-brand-blue hover:shadow-sm transition-all text-left"
                >
                  <div>
                    <div className="font-bold text-brand-black">{v.plate} - {v.brand} {v.modelYear}</div>
                    <div className="text-sm text-gray-500">Propietario: {v.client.firstName} {v.client.lastName}</div>
                  </div>
                  <div className="text-brand-blue text-sm font-medium">Seleccionar</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedVehicle && (
        <form action={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-200">
              {error}
            </div>
          )}

          {/* Vehículo Seleccionado */}
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-brand-blue p-2 rounded-full">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Vehículo Seleccionado</p>
                <p className="font-bold text-brand-black text-lg">{selectedVehicle.plate} - {selectedVehicle.brand}</p>
                <p className="text-sm text-gray-600">{selectedVehicle.client.firstName} {selectedVehicle.client.lastName} {selectedVehicle.client.email ? `(${selectedVehicle.client.email})` : ''}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedVehicle(null)}
              className="text-sm text-brand-blue hover:underline font-medium"
            >
              Cambiar
            </button>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-brand-blue" /> Fecha
              </label>
              <input required name="scheduledDate" type="date" min={todayDate} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 p-2.5 outline-none border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-blue" /> Hora (8:00 AM - 5:00 PM)
              </label>
              <input required name="scheduledTime" type="time" min="08:00" max="17:00" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 p-2.5 outline-none border" />
            </div>
          </div>

          {/* Opciones de Notificación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Opciones de Notificación al Cliente</label>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={notifyEmail} 
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  disabled={!selectedVehicle.client.email}
                  className="w-5 h-5 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
                />
                <div className="flex-1">
                  <p className="font-medium text-brand-black">Notificar por Correo Electrónico</p>
                  {!selectedVehicle.client.email && (
                    <p className="text-xs text-amber-600">El cliente no tiene correo registrado.</p>
                  )}
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-green-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={notifyWhatsapp} 
                  onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                  className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                />
                <div className="flex-1">
                  <p className="font-medium text-green-800">Enviar Confirmación por WhatsApp</p>
                  <p className="text-xs text-green-600">Se abrirá WhatsApp Web con un mensaje predefinido para enviar al cliente ({selectedVehicle.client.phone}).</p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-bold text-brand-black bg-brand-yellow hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow transition-colors disabled:opacity-50"
            >
              {isPending ? "Agendando..." : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Agendar Cita
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
