export async function sendEmail({
  to,
  subject,
  htmlContent,
}: {
  to: { email: string; name: string };
  subject: string;
  htmlContent: string;
}) {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;

  if (!BREVO_API_KEY) {
    console.warn("BREVO_API_KEY no está configurado. El correo no se enviará.");
    return false;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: "no-reply@tecnicentroloscarros.com", name: "Tecnicentro Los Carros" },
        to: [to],
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      console.error("Error enviando correo con Brevo:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error en sendEmail:", error);
    return false;
  }
}
