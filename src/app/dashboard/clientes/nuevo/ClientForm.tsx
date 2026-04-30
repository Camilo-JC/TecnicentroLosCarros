"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientWithVehicle } from "../actions";
import { Save, User, Car } from "lucide-react";

export default function ClientForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await createClientWithVehicle(formData);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/dashboard/clientes");
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-200">
          {error}
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-brand-black flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <User className="w-5 h-5 text-brand-blue" />
          Datos del Cliente
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
            <input required name="firstName" type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 p-2.5 outline-none border" placeholder="Juan Carlos" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
            <input required name="lastName" type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 p-2.5 outline-none border" placeholder="Pérez" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cédula *</label>
            <input required name="documentId" type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 p-2.5 outline-none border" placeholder="1234567890" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
            <input required name="phone" type="tel" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 p-2.5 outline-none border" placeholder="3001234567" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico (Opcional)</label>
            <input name="email" type="email" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 p-2.5 outline-none border" placeholder="juan@ejemplo.com" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-brand-black flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <Car className="w-5 h-5 text-brand-blue" />
          Datos del Vehículo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Placa *</label>
            <input required name="plate" type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 p-2.5 outline-none border uppercase" placeholder="ABC-123" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
            <input required name="brand" type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 p-2.5 outline-none border" placeholder="Chevrolet" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo / Año *</label>
            <input required name="modelYear" type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 p-2.5 outline-none border" placeholder="Spark 2015" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-bold text-brand-black bg-brand-yellow hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow transition-colors disabled:opacity-50"
        >
          {isPending ? "Guardando..." : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Registro
            </>
          )}
        </button>
      </div>
    </form>
  );
}
