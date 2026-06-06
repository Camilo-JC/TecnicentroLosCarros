"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/brevo";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export async function getAppointments() {
  return await prisma.appointment.findMany({
    include: {
      client: true,
      vehicle: true,
      services: true,
    },
    orderBy: [
      { scheduledDate: "asc" },
      { scheduledTime: "asc" },
    ],
  });
}

export async function createAppointment(formData: FormData) {
  const vehicleId = formData.get("vehicleId") as string;
  const clientId = formData.get("clientId") as string;
  const dateStr = formData.get("scheduledDate") as string;
  const timeStr = formData.get("scheduledTime") as string; // Jornada: "MAÑANA" o "TARDE"
  const notifyEmail = formData.get("notifyEmail") === "true";
  const notifyWhatsapp = formData.get("notifyWhatsapp") === "true";

  // Obtener todos los IDs de servicios seleccionados
  const serviceIds = formData.getAll("services") as string[];

  if (!vehicleId || !clientId || !dateStr || !timeStr) {
    return { error: "Faltan campos obligatorios." };
  }

  if (serviceIds.length === 0) {
    return { error: "Debes seleccionar al menos un servicio de mantenimiento." };
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
        status: "PENDING",
        services: {
          connect: serviceIds.map((id) => ({ id })),
        },
      },
      include: {
        client: true,
        vehicle: true,
        services: true,
      },
    });

    const fechaFormateada = format(scheduledDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
    const jornadaTexto = timeStr === "MAÑANA" ? "Mañana" : "Tarde";
    const serviciosTexto = appointment.services.map((s) => s.name).join(", ");

    // 1. Notificación por Correo Electrónico (Brevo)
    if (notifyEmail && appointment.client.email) {
      const htmlContent = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a; max-w-md; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
          <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #fde047; padding-bottom: 15px;">
            <h1 style="color: #1e3a8a; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Tecnicentro Los Carros</h1>
            <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 1px;">Confirmación de Cita Automotriz</span>
          </div>
          <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">Hola <strong>${appointment.client.firstName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">Tu cita de mantenimiento ha sido agendada con éxito. A continuación te presentamos el resumen de tu programación:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9; margin: 20px 0; font-size: 14px; line-height: 1.5;">
            <div style="margin-bottom: 10px;">🚗 <strong>Vehículo:</strong> ${appointment.vehicle.plate} (${appointment.vehicle.brand} ${appointment.vehicle.model || ""})</div>
            <div style="margin-bottom: 10px;">📅 <strong>Fecha:</strong> ${fechaFormateada}</div>
            <div style="margin-bottom: 10px;">⏰ <strong>Jornada:</strong> ${jornadaTexto}</div>
            <div style="border-top: 1px solid #e2e8f0; margin-top: 10px; padding-top: 10px;">
              🛠️ <strong>Servicios Solicitados:</strong>
              <ul style="margin: 5px 0 0 0; padding-left: 20px; color: #1e3a8a; font-weight: 600;">
                ${appointment.services.map((s) => `<li style="margin-bottom: 4px;">${s.name}</li>`).join("")}
              </ul>
            </div>
          </div>
          
          <p style="font-size: 13px; line-height: 1.5; color: #64748b; text-align: center; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            Si tienes alguna duda o necesitas reprogramar tu cita, por favor contáctanos.<br />
            <strong>¡Te esperamos!</strong>
          </p>
        </div>
      `;

      await sendEmail({
        to: {
          email: appointment.client.email,
          name: `${appointment.client.firstName} ${appointment.client.lastName}`,
        },
        subject: "Confirmación de Cita - Tecnicentro Los Carros",
        htmlContent,
      });
    }

    // 2. Notificación por WhatsApp
    let whatsappUrl = null;
    if (notifyWhatsapp && appointment.client.phone) {
      const portalUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/portal/vehiculo/${appointment.vehicle.token}`;
      const message = `¡Hola, *${appointment.client.firstName}*! 🚗\n\nConfirmamos tu cita de servicio en *Tecnicentro Los Carros*:\n\n` +
        `• *Placa:* ${appointment.vehicle.plate}\n` +
        `• *Vehículo:* ${appointment.vehicle.brand} ${appointment.vehicle.model || ""}\n` +
        `• *Fecha:* ${fechaFormateada}\n` +
        `• *Jornada:* ${jornadaTexto}\n` +
        `• *Servicios:* ${serviciosTexto}\n\n` +
        `Puedes consultar tu historial de mantenimientos y autogestionar tus citas aquí:\n🔗 ${portalUrl}\n\n` +
        `¡Te esperamos!\n_Tecnicentro Los Carros - La mejor decisión para su carro y usted._`;

      const result = await sendWhatsAppMessage(appointment.client.phone, message);
      whatsappUrl = result.url || null;
    }

    revalidatePath("/dashboard/citas");
    return { success: true, whatsappUrl };
  } catch (error: any) {
    console.error("Error al registrar la cita:", error);
    return { error: "Ocurrió un error al agendar la cita." };
  }
}

export async function updateAppointmentStatus(id: string, status: string) {
  await prisma.appointment.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/dashboard/citas");
}

export async function rescheduleAppointment(id: string, dateStr: string, timeStr: string) {
  const scheduledDate = new Date(dateStr);
  scheduledDate.setHours(12, 0, 0, 0);

  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        scheduledDate,
        scheduledTime: timeStr,
      },
      include: {
        client: true,
        vehicle: true,
        services: true,
      },
    });

    const fechaFormateada = format(scheduledDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
    const jornadaTexto = timeStr === "MAÑANA" ? "Mañana" : "Tarde";
    const serviciosTexto = appointment.services.map((s) => s.name).join(", ");

    // Enviar notificación por correo de reprogramación
    if (appointment.client.email) {
      const htmlContent = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a; max-w-md; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
          <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #fde047; padding-bottom: 15px;">
            <h1 style="color: #1e3a8a; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Tecnicentro Los Carros</h1>
            <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 1px;">Reprogramación de Cita Automotriz</span>
          </div>
          <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">Hola <strong>${appointment.client.firstName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">Tu cita de mantenimiento ha sido reprogramada con éxito. A continuación te presentamos el nuevo horario:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9; margin: 20px 0; font-size: 14px; line-height: 1.5;">
            <div style="margin-bottom: 10px;">🚗 <strong>Vehículo:</strong> ${appointment.vehicle.plate} (${appointment.vehicle.brand} ${appointment.vehicle.model || ""})</div>
            <div style="margin-bottom: 10px;">📅 <strong>Nueva Fecha:</strong> ${fechaFormateada}</div>
            <div style="margin-bottom: 10px;">⏰ <strong>Nueva Jornada:</strong> ${jornadaTexto}</div>
            <div style="border-top: 1px solid #e2e8f0; margin-top: 10px; padding-top: 10px;">
              🛠️ <strong>Servicios:</strong> ${serviciosTexto}
            </div>
          </div>
          
          <p style="font-size: 13px; line-height: 1.5; color: #64748b; text-align: center; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            ¡Te esperamos!
          </p>
        </div>
      `;

      await sendEmail({
        to: {
          email: appointment.client.email,
          name: `${appointment.client.firstName} ${appointment.client.lastName}`,
        },
        subject: "Reprogramación de Cita - Tecnicentro Los Carros",
        htmlContent,
      });
    }

    // Enviar notificación por WhatsApp de reprogramación
    const portalUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/portal/vehiculo/${appointment.vehicle.token}`;
    const message = `¡Hola, *${appointment.client.firstName}*! 🚗\n\nTu cita en *Tecnicentro Los Carros* ha sido reprogramada:\n\n` +
      `• *Placa:* ${appointment.vehicle.plate}\n` +
      `• *Vehículo:* ${appointment.vehicle.brand} ${appointment.vehicle.model || ""}\n` +
      `• *Nueva Fecha:* ${fechaFormateada}\n` +
      `• *Nueva Jornada:* ${jornadaTexto}\n` +
      `• *Servicios:* ${serviciosTexto}\n\n` +
      `Puedes autogestionar tus citas o ver tu historial de mantenimientos aquí:\n🔗 ${portalUrl}\n\n` +
      `¡Te esperamos!\n_Tecnicentro Los Carros_`;

    const result = await sendWhatsAppMessage(appointment.client.phone, message);

    revalidatePath("/dashboard/citas");
    return { success: true, whatsappUrl: result.url || null };
  } catch (error) {
    console.error("Error al reprogramar la cita:", error);
    return { error: "Ocurrió un error al reprogramar la cita." };
  }
}
