import ServiceForm from "./ServiceForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NuevoServicioPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link 
          href="/dashboard/servicios" 
          className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-brand-blue mb-1">Registrar Servicio</h1>
          <p className="text-gray-600">Busca el vehículo y detalla las actividades realizadas.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <ServiceForm />
      </div>
    </div>
  );
}
