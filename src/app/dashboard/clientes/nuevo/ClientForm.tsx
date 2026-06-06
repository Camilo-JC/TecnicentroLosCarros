"use client";

import { useTransition, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClientWithVehicle } from "../actions";
import { Save, User, Car } from "lucide-react";
import { COLOMBIAN_CAR_BRANDS, BRAND_MODELS_MAP, CarBrand } from "@/lib/carCatalogs";

export default function ClientForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Auto-complete Brand State
  const [brandInput, setBrandInput] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<CarBrand | null>(null);
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const brandContainerRef = useRef<HTMLDivElement>(null);

  // Model State
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("");

  // Filter brand suggestions as the user types
  useEffect(() => {
    if (!brandInput) {
      setBrandSuggestions([]);
      setSelectedBrand(null);
      setAvailableModels([]);
      setSelectedModel("");
      return;
    }

    const filtered = COLOMBIAN_CAR_BRANDS.filter(brand =>
      brand.toLowerCase().includes(brandInput.toLowerCase())
    );
    setBrandSuggestions(filtered);

    // If the input matches a valid brand exactly, select it
    const exactMatch = COLOMBIAN_CAR_BRANDS.find(
      brand => brand.toLowerCase() === brandInput.toLowerCase()
    );
    if (exactMatch) {
      setSelectedBrand(exactMatch);
      setAvailableModels(BRAND_MODELS_MAP[exactMatch] || []);
    } else {
      setSelectedBrand(null);
      setAvailableModels([]);
      setSelectedModel("");
    }
  }, [brandInput]);

  // Handle click outside suggestions to close them
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (brandContainerRef.current && !brandContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectBrand = (brand: CarBrand) => {
    setBrandInput(brand);
    setSelectedBrand(brand);
    setAvailableModels(BRAND_MODELS_MAP[brand] || []);
    setShowSuggestions(false);
    setSelectedModel("");
  };

  const handleSubmit = async (formData: FormData) => {
    setError(null);

    if (!selectedBrand) {
      setError("Debes seleccionar una marca válida de la lista comercializada en Colombia.");
      return;
    }

    formData.set("brand", selectedBrand);

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
            <input required name="firstName" type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 p-2.5 outline-none border" placeholder="Camilo" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
            <input required name="lastName" type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 p-2.5 outline-none border" placeholder="Caballero" />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
            <input required name="address" type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 p-2.5 outline-none border" placeholder="Calle 123 # 45-67, Bogotá" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico (Opcional)</label>
            <input name="email" type="email" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 p-2.5 outline-none border" placeholder="camilo@ejemplo.com" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-brand-black flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <Car className="w-5 h-5 text-brand-blue" />
          Datos del Vehículo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Placa *</label>
            <input required name="plate" type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 p-2.5 outline-none border uppercase" placeholder="ABC-123" />
          </div>
          
          {/* Autocompletar Marca */}
          <div className="relative" ref={brandContainerRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
            <input
              required
              type="text"
              value={brandInput}
              onChange={(e) => {
                setBrandInput(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 p-2.5 outline-none border"
              placeholder="Escribe la marca..."
              autoComplete="off"
            />
            {showSuggestions && brandSuggestions.length > 0 && (
              <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y divide-gray-50">
                {brandSuggestions.map((brand) => (
                  <li key={brand}>
                    <button
                      type="button"
                      onClick={() => handleSelectBrand(brand as CarBrand)}
                      className="w-full text-left p-2.5 text-sm text-gray-800 hover:bg-slate-50 hover:text-brand-blue transition-colors font-medium"
                    >
                      {brand}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Carga Dinámica de Modelos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
            <select
              required
              name="model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={!selectedBrand}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 p-2.5 outline-none border disabled:opacity-50 text-gray-900"
            >
              <option value="">Selecciona un modelo</option>
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año *</label>
            <input required name="modelYear" type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 p-2.5 outline-none border" placeholder="2026" />
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
