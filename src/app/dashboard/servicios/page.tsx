import { getServices } from "./actions";
import Link from "next/link";
import { PlusCircle, Wrench, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function ServiciosPage() {
  const services = await getServices();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-blue mb-2">Servicios Realizados</h1>
          <p className="text-gray-600">Historial de mantenimientos y servicios registrados.</p>
        </div>
        <Link 
          href="/dashboard/servicios/nuevo" 
          className="flex items-center gap-2 bg-brand-yellow hover:bg-yellow-400 text-brand-black font-bold py-2 px-4 rounded-lg transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          Nuevo Servicio
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b">
                <th className="p-4 font-medium">Fecha</th>
                <th className="p-4 font-medium">Vehículo / Cliente</th>
                <th className="p-4 font-medium">Actividades</th>
                <th className="p-4 font-medium">Valor Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.length > 0 ? (
                services.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-gray-600 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-brand-blue" />
                        {format(new Date(service.date), "dd MMM yyyy, HH:mm", { locale: es })}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-brand-black">{service.vehicle.plate} - {service.vehicle.brand}</div>
                      <div className="text-sm text-gray-500">{service.vehicle.client.firstName} {service.vehicle.client.lastName}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {service.activities.map(act => (
                          <span key={act.id} className="bg-blue-50 text-brand-blue px-2 py-1 rounded text-xs font-medium border border-blue-100 flex items-center gap-1">
                            <Wrench className="w-3 h-3" />
                            {act.name}
                          </span>
                        ))}
                      </div>
                      {service.description && (
                        <p className="text-xs text-gray-400 mt-2 line-clamp-2">{service.description}</p>
                      )}
                    </td>
                    <td className="p-4 font-bold text-brand-black">
                      ${service.totalValue.toLocaleString('es-CO')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No se han registrado servicios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
