"use client";

import { Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

export default function ServiceSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== initialQuery) {
        startTransition(() => {
          const params = new URLSearchParams(searchParams.toString());
          if (query) {
            params.set("q", query);
          } else {
            params.delete("q");
          }
          router.replace(`${pathname}?${params.toString()}`);
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, router, pathname, searchParams, initialQuery]);

  return (
    <div className="relative max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className={`h-5 w-5 ${isPending ? 'text-brand-blue animate-pulse' : 'text-gray-400'}`} />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-white p-2.5 outline-none border"
        placeholder="Buscar servicio por cédula o placa..."
      />
    </div>
  );
}
