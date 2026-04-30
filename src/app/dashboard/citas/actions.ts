"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/brevo";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export async function getAppointments() {
  return await prisma.appointment.findMany({
    include: {
      client: true,
      vehicle: true,
    },
    orderBy: [
      { scheduledDate: 'asc' },
      { scheduledTime: 'asc' }
    ]
  });
}

export async function createAppointment(formData: FormData) {
  const vehicleId = formData.get("vehicleId") as string;
  const clientId = formData.get("clientId") as string;
  const dateStr = formData.get("scheduledDate") as string;
  const timeStr = formData.get("scheduledTime") as string;
  const notifyEmail = formData.get("notifyEmail") === "true";
  const notifyWhatsapp = formData.get("notifyWhatsapp") === "true";

  if (!vehicleId || !clientId || !dateStr || !timeStr) {
    return { error: "Faltan campos obligatorios." };
  }

  const scheduledDate = new Date(dateStr);
  scheduledDate.setHours(12, 0, 0, 0); // Evitar problemas de timezone

  try {
    const appointment = await prisma.appointment.create({
      data: {
        clientId,
        vehicleId,
        scheduledDate,
        scheduledTime: timeStr,
        status: "PENDING"
      },
      include: {
        client: true,
        vehicle: true
      }
    });

    const fechaFormateada = format(scheduledDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });

    if (notifyEmail && appointment.client.email) {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #171717; max-w-md; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1e3a8a;">Tecnicentro Los Carros</h1>
          <h2>Confirmación de Cita Automotriz</h2>
          <p>Hola <strong>${appointment.client.firstName}</strong>,</p>
          <p>Tu cita para el vehículo <strong>${appointment.vehicle.plate}</strong> ha sido agendada exitosamente.</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Fecha:</strong> ${fechaFormateada}</p>
            <p><strong>Hora:</strong> ${timeStr}</p>
          </div>
          <p>¡Te esperamos!</p>
        </div>
      `;

      await sendEmail({
        to: { email: appointment.client.email, name: `${appointment.client.firstName} ${appointment.client.lastName}` },
        subject: "Confirmación de Cita - Tecnicentro Los Carros",
        htmlContent
      });
    }

    let whatsappUrl = null;
    if (notifyWhatsapp && appointment.client.phone) {
      // Formato básico para el enlace de WhatsApp
      let phone = appointment.client.phone.replace(/\D/g, '');
      if (phone.length === 10) phone = `57${phone}`; // Asumimos prefijo +57 Colombia si tiene 10 dígitos (celular normal)
      
      const message = `Hola ${appointment.client.firstName}, te confirmamos tu cita en Tecnicentro Los Carros para el vehículo ${appointment.vehicle.plate} el día ${fechaFormateada} a las ${timeStr}. ¡Te esperamos!`;
      whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    }

    revalidatePath("/dashboard/citas");
    return { success: true, whatsappUrl };
  } catch (error: any) {
    return { error: "Ocurrió un error al agendar la cita." };
  }
}

export async function updateAppointmentStatus(id: string, status: string) {
  await prisma.appointment.update({
    where: { id },
    data: { status }
  });
  revalidatePath("/dashboard/citas");
}
