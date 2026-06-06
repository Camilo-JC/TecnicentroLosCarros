/**
 * Módulo de integración de WhatsApp
 * Soporta envío automático a través de Meta Cloud API, Twilio o enlace manual.
 */

export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  // Limpiar el número de teléfono (solo números)
  let cleanPhone = to.replace(/\D/g, "");
  
  // Agregar prefijo de Colombia (+57) si tiene 10 dígitos (celular típico colombiano)
  if (cleanPhone.length === 10) {
    cleanPhone = `57${cleanPhone}`;
  }

  const provider = process.env.WHATSAPP_PROVIDER || "MANUAL";

  if (provider === "META") {
    const token = process.env.META_WHATSAPP_TOKEN;
    const phoneId = process.env.META_PHONE_NUMBER_ID;

    if (!token || !phoneId) {
      console.warn("Advertencia: Configuración de Meta Cloud API incompleta. Usando fallback manual.");
      return { success: false, url: buildManualUrl(cleanPhone, message) };
    }

    try {
      // Envío real con Meta Cloud API (se asume plantilla o mensaje de sesión de texto libre)
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${phoneId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: cleanPhone,
            type: "text",
            text: { preview_url: false, body: message },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error("Error al enviar mensaje por Meta API:", errText);
        return { success: false, error: errText };
      }

      return { success: true };
    } catch (error: any) {
      console.error("Error en conexión con Meta API:", error);
      return { success: false, error: error.message };
    }
  }

  if (provider === "TWILIO") {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER; // Formato: whatsapp:+14155238886

    if (!accountSid || !authToken || !fromPhone) {
      console.warn("Advertencia: Configuración de Twilio WhatsApp incompleta. Usando fallback manual.");
      return { success: false, url: buildManualUrl(cleanPhone, message) };
    }

    try {
      // Envío usando la API SMTP/HTTP de Twilio
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: `whatsapp:+${cleanPhone}`,
            From: fromPhone.startsWith("whatsapp:") ? fromPhone : `whatsapp:${fromPhone}`,
            Body: message,
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error("Error al enviar por Twilio:", errText);
        return { success: false, error: errText };
      }

      return { success: true };
    } catch (error: any) {
      console.error("Error en conexión con Twilio API:", error);
      return { success: false, error: error.message };
    }
  }

  // Fallback MANUAL por defecto: retorna el link wa.me para abrir en nueva pestaña
  return { success: true, url: buildManualUrl(cleanPhone, message) };
}

function buildManualUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
