"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { createService, searchVehiclesByPlate } from "../actions";
import { Save, Search, Car, CheckSquare, DollarSign, AlignLeft, Plus } from "lucide-react";

const PREDEFINED_ACTIVITIES = [
  "Sincronización", "Cambio de aceite", "Alineación", "Balanceo", 
  "Revisión de frenos", "Revisión de suspensión", "Scanner", 
  "Montaje de llanta", "Nitrógeno", "Latonería", "Pintura"
];

export default function ServiceForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [plateQuery, setPlateQuery] = useState("");
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [customActivity, setCustomActivity] = useState("");

  const handleSearchVehicle = async () => {
    if (!plateQuery) return;
    const results = await searchVehiclesByPlate(plateQuery);
    setVehicles(results);
    setSelectedVehicle(null);
  };

  const toggleActivity = (act: string) => {
    if (selectedActivities.includes(act)) {
      setSelectedActivities(prev => prev.filter(a => a !== act));
    } else {
      setSelectedActivities(prev => [...prev, act]);
    }
  };

  const addCustomActivity = () => {
    if (customActivity.trim() && !selectedActivities.includes(customActivity.trim())) {
      setSelectedActivities(prev => [...prev, customActivity.trim()]);
      setCustomActivity("");
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    if (!selectedVehicle) {
      setError("Debes seleccionar un vehículo primero.");
      return;
    }
    if (selectedActivities.length === 0) {
      setError("Debes registrar al menos una actividad.");
      return;
    }

    formData.append("vehicleId", selectedVehicle.id);

    startTransition(async () => {
      const result = await createService(formData, selectedActivities);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/dashboard/servicios");
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
                onKeyDown={(e) => e.key === 'Enter' && handleSearchVehicle()}
                className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-white p-2.5 outline-none border uppercase"
                placeholder="ABC-123"
              />
            </div>
            <button
              type="button"
              onClick={handleSearchVehicle}
              className="bg-brand-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors"
            >
              Buscar
            </button>
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
                <p className="text-sm text-gray-600">{selectedVehicle.client.firstName} {selectedVehicle.client.lastName}</p>
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

          {/* Actividades */}
          <div>
            <h2 className="text-lg font-bold text-brand-black flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
              <CheckSquare className="w-5 h-5 text-brand-blue" />
              Actividades Realizadas
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
              {PREDEFINED_ACTIVITIES.map(act => {
                const isSelected = selectedActivities.includes(act);
                return (
                  <button
                    key={act}
                    type="button"
                    onClick={() => toggleActivity(act)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all text-left flex justify-between items-center ${
                      isSelected 
                        ? 'bg-brand-yellow border-yellow-500 text-brand-black shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span>{act}</span>
                    {isSelected && <CheckSquare className="w-4 h-4" />}
                  </button>
                )
              })}
            </div>
            
            {/* Agregar Otra Actividad */}
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={customActivity}
                onChange={(e) => setCustomActivity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomActivity())}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-white p-2 text-sm outline-none border"
                placeholder="Otra actividad..."
              />
              <button
                type="button"
                onClick={addCustomActivity}
                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Agregar
              </button>
            </div>

            {selectedActivities.filter(a => !PREDEFINED_ACTIVITIES.includes(a)).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedActivities.filter(a => !PREDEFINED_ACTIVITIES.includes(a)).map(act => (
                  <span key={act} className="bg-brand-yellow text-brand-black px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                    {act}
                    <button type="button" onClick={() => toggleActivity(act)} className="text-brand-black hover:text-red-600">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Detalles Financieros y Descripción */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-bold text-brand-black flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                <DollarSign className="w-5 h-5 text-brand-blue" />
                Valor Total (Conjunto de Servicios)
              </h2>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-bold">$</span>
                </div>
                <input required name="totalValue" type="number" min="0" step="0.01" className="pl-8 w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 p-3 outline-none border text-lg font-bold text-brand-black" placeholder="0.00" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Corresponde al valor total cobrado por todas las actividades realizadas.</p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-brand-black flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                <AlignLeft className="w-5 h-5 text-brand-blue" />
                Descripción Adicional (Opcional)
              </h2>
              <textarea name="description" rows={3} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 p-3 outline-none border text-sm" placeholder="Detalles, observaciones o recomendaciones..." />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={isPending || selectedActivities.length === 0}
              className="flex items-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-bold text-brand-black bg-brand-yellow hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow transition-colors disabled:opacity-50"
            >
              {isPending ? "Guardando..." : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Registrar Servicio
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
