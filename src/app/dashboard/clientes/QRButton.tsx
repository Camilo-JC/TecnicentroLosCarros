"use client";

import { useState } from "react";
import { QrCode, Copy, Check, X } from "lucide-react";

interface QRButtonProps {
  plate: string;
  brand: string;
  model: string;
  token: string;
  clientName: string;
}

export default function QRButton({ plate, brand, model, token, clientName }: QRButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const portalUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/portal/vehiculo/${token}` 
    : `/portal/vehiculo/${token}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(portalUrl)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(portalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-bold border border-slate-200 transition-colors"
        title="Ver QR y Portal de Autogestión"
      >
        <QrCode className="w-3.5 h-3.5" />
        QR Portal
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200 text-left">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h3 className="text-lg font-bold text-brand-blue mb-1">
                Portal de Autogestión
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Para: <span className="font-bold text-brand-black">{plate}</span> ({brand} {model}) - {clientName}
              </p>

              {/* QR Image Container */}
              <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 inline-block mb-6">
                <img
                  src={qrImageUrl}
                  alt={`QR Code para ${plate}`}
                  className="w-48 h-48 mx-auto"
                />
              </div>

              {/* Link Input and Copy Button */}
              <div className="space-y-3">
                <label className="block text-xs font-medium text-gray-700 text-left">
                  Enlace único del cliente:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={portalUrl}
                    className="flex-1 bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs text-gray-600 outline-none select-all"
                  />
                  <button
                    onClick={handleCopy}
                    className="bg-brand-blue text-white p-2 rounded-lg hover:bg-blue-800 transition-colors"
                    title="Copiar Enlace"
                  >
                    {copied ? (
                      <Check className="w-4.5 h-4.5 text-brand-yellow" />
                    ) : (
                      <Copy className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 text-left leading-normal">
                  * Escanea el código QR con un celular o comparte el enlace para que el cliente solicite citas y consulte su historial sin intervención.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
