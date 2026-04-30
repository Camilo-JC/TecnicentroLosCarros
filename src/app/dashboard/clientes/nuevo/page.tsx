import ClientForm from "./ClientForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NuevoClientePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link 
          href="/dashboard/clientes" 
          className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-brand-blue mb-1">Registrar Cliente</h1>
          <p className="text-gray-600">Ingresa la información del cliente y su vehículo inicial.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <ClientForm />
      </div>
    </div>
  );
}
