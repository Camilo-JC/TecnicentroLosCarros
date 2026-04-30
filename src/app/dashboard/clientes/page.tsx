import { getClients } from "./actions";
import ClientSearch from "./ClientSearch";
import Link from "next/link";
import { PlusCircle, Car } from "lucide-react";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";
  const clients = await getClients(query);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-blue mb-2">Clientes y Vehículos</h1>
          <p className="text-gray-600">Busca por cédula o placa para encontrar clientes.</p>
        </div>
        <Link 
          href="/dashboard/clientes/nuevo" 
          className="flex items-center gap-2 bg-brand-yellow hover:bg-yellow-400 text-brand-black font-bold py-2 px-4 rounded-lg transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          Nuevo Cliente
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <ClientSearch initialQuery={query} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-gray-500 text-sm border-b">
                <th className="p-4 font-medium">Cliente</th>
                <th className="p-4 font-medium">Cédula</th>
                <th className="p-4 font-medium">Contacto</th>
                <th className="p-4 font-medium">Vehículos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.length > 0 ? (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-brand-black">{client.firstName} {client.lastName}</div>
                    </td>
                    <td className="p-4 text-gray-600">{client.documentId}</td>
                    <td className="p-4 text-gray-600">
                      <div>{client.phone}</div>
                      <div className="text-sm text-gray-400">{client.email || 'Sin correo'}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {client.vehicles.map(v => (
                          <div key={v.id} className="flex items-center gap-2 bg-blue-50 text-brand-blue px-2 py-1 rounded text-sm w-fit font-medium border border-blue-100">
                            <Car className="w-3 h-3" />
                            {v.plate} - {v.brand}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No se encontraron clientes o vehículos con ese criterio de búsqueda.
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
