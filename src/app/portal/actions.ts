"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { sendEmail } from "@/lib/brevo";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function getPortalData(token: string) {
  if (!token) return null;

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { token },
      include: {
        client: true,
        services: {
          include: {
            activities: true,
          },
          orderBy: { createdAt: "desc" },
        },
        appointments: {
          where: {
            status: "PENDING",
          },
          include: {
            services: true,
          },
          orderBy: [
            { scheduledDate: "asc" },
            { scheduledTime: "asc" },
          ],
        },
      },
    });

    if (!vehicle) return null;

    // Obtener los servicios activos para el formulario de agendamiento
    const activeServices = await prisma.maintenanceService.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return {
      vehicle,
      activeServices,
    };
  } catch (error) {
    console.error("Error al obtener datos del portal:", error);
    return null;
  }
}

export async function portalCreateAppointment(
  token: string,
  dateStr: string,
  timeStr: string, // "MAÑANA" o "TARDE"
  serviceIds: string[]
) {
  if (!token || !dateStr || !timeStr || !serviceIds || serviceIds.length === 0) {
    return { error: "Faltan campos obligatorios. Debes seleccionar al menos un servicio." };
  }

  const scheduledDate = new Date(dateStr);
  scheduledDate.setHours(12, 0, 0, 0); // Evitar problemas de timezone

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { token },
      include: { client: true },
    });

    if (!vehicle) {
      return { error: "El vehículo no existe o el token no es válido." };
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientId: vehicle.clientId,
        vehicleId: vehicle.id,
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

    // Enviar confirmación al cliente por correo (Brevo) si tiene
    if (appointment.client.email) {
      const htmlContent = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a; max-w-md; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
          <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #fde047; padding-bottom: 15px;">
            <h1 style="color: #1e3a8a; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Tecnicentro Los Carros</h1>
            <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 1px;">Nueva Solicitud de Cita (Autogestión)</span>
          </div>
          <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">Hola <strong>${appointment.client.firstName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">Tu solicitud de cita ha sido registrada con éxito. A continuación te presentamos el resumen:</p>
          
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
            La cita está en estado <strong>PENDIENTE DE CONFIRMACIÓN</strong>. Te esperamos.<br />
            <strong>¡Gracias por preferirnos!</strong>
          </p>
        </div>
      `;

      await sendEmail({
        to: {
          email: appointment.client.email,
          name: `${appointment.client.firstName} ${appointment.client.lastName}`,
        },
        subject: "Confirmación de Solicitud de Cita - Tecnicentro Los Carros",
        htmlContent,
      });
    }

    // Enviar WhatsApp al cliente
    const portalUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/portal/vehiculo/${token}`;
    const whatsappMsg = `¡Hola, *${appointment.client.firstName}*! 🚗\n\nTu solicitud de cita en *Tecnicentro Los Carros* se ha registrado exitosamente:\n\n` +
      `• *Placa:* ${appointment.vehicle.plate}\n` +
      `• *Vehículo:* ${appointment.vehicle.brand} ${appointment.vehicle.model || ""}\n` +
      `• *Fecha:* ${fechaFormateada}\n` +
      `• *Jornada:* ${jornadaTexto}\n` +
      `• *Servicios:* ${serviciosTexto}\n\n` +
      `Tu cita está en espera de atención. Puedes reprogramarla o ver tu historial de mantenimientos aquí:\n🔗 ${portalUrl}\n\n` +
      `¡Te esperamos!\n_Tecnicentro Los Carros_`;

    await sendWhatsAppMessage(appointment.client.phone, whatsappMsg);

    revalidatePath(`/portal/vehiculo/${token}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error al crear cita desde el portal:", error);
    return { error: "Ocurrió un error al agendar la cita. Por favor intenta de nuevo." };
  }
}

export async function portalRescheduleAppointment(
  appointmentId: string,
  token: string,
  dateStr: string,
  timeStr: string // "MAÑANA" o "TARDE"
) {
  if (!appointmentId || !token || !dateStr || !timeStr) {
    return { error: "Faltan campos obligatorios." };
  }

  const scheduledDate = new Date(dateStr);
  scheduledDate.setHours(12, 0, 0, 0);

  try {
    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
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

    // Notificación por correo (Brevo) si tiene
    if (appointment.client.email) {
      const htmlContent = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a; max-w-md; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
          <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #fde047; padding-bottom: 15px;">
            <h1 style="color: #1e3a8a; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Tecnicentro Los Carros</h1>
            <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 1px;">Reprogramación de Cita (Autogestión)</span>
          </div>
          <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">Hola <strong>${appointment.client.firstName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">Tu cita de mantenimiento ha sido reprogramada por ti con éxito. A continuación te presentamos el nuevo horario:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9; margin: 20px 0; font-size: 14px; line-height: 1.5;">
            <div style="margin-bottom: 10px;">🚗 <strong>Vehículo:</strong> ${appointment.vehicle.plate} (${appointment.vehicle.brand} ${appointment.vehicle.model || ""})</div>
            <div style="margin-bottom: 10px;">📅 <strong>Nueva Fecha:</strong> ${fechaFormateada}</div>
            <div style="margin-bottom: 10px;">⏰ <strong>Nueva Jornada:</strong> ${jornadaTexto}</div>
            <div style="border-top: 1px solid #e2e8f0; margin-top: 10px; padding-top: 10px;">
              🛠️ <strong>Servicios:</strong> ${serviciosTexto}
            </div>
          </div>
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

    // Enviar WhatsApp al cliente
    const portalUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/portal/vehiculo/${token}`;
    const whatsappMsg = `¡Hola, *${appointment.client.firstName}*! 🚗\n\nHas reprogramado tu cita en *Tecnicentro Los Carros* con éxito:\n\n` +
      `• *Placa:* ${appointment.vehicle.plate}\n` +
      `• *Vehículo:* ${appointment.vehicle.brand} ${appointment.vehicle.model || ""}\n` +
      `• *Nueva Fecha:* ${fechaFormateada}\n` +
      `• *Nueva Jornada:* ${jornadaTexto}\n` +
      `• *Servicios:* ${serviciosTexto}\n\n` +
      `Puedes consultar o volver a reprogramar tu cita aquí:\n🔗 ${portalUrl}\n\n` +
      `¡Te esperamos!\n_Tecnicentro Los Carros_`;

    await sendWhatsAppMessage(appointment.client.phone, whatsappMsg);

    revalidatePath(`/portal/vehiculo/${token}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error al reprogramar cita desde el portal:", error);
    return { error: "Ocurrió un error al reprogramar la cita." };
  }
}

export async function portalCancelAppointment(appointmentId: string, token: string) {
  if (!appointmentId || !token) {
    return { error: "Datos incompletos." };
  }

  try {
    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "CANCELLED",
      },
      include: {
        client: true,
        vehicle: true,
      },
    });

    // Enviar correo de cancelación si tiene
    if (appointment.client.email) {
      const htmlContent = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a; max-w-md; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
          <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #ef4444; padding-bottom: 15px;">
            <h1 style="color: #ef4444; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Tecnicentro Los Carros</h1>
            <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 1px;">Cita Cancelada</span>
          </div>
          <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">Hola <strong>${appointment.client.firstName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">Te confirmamos que tu cita de servicio automotriz para el vehículo con placa <strong>${appointment.vehicle.plate}</strong> ha sido <strong>CANCELADA</strong> de forma exitosa.</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">Si deseas agendar otra cita, puedes hacerlo en cualquier momento a través del portal.</p>
        </div>
      `;

      await sendEmail({
        to: {
          email: appointment.client.email,
          name: `${appointment.client.firstName} ${appointment.client.lastName}`,
        },
        subject: "Cancelación de Cita - Tecnicentro Los Carros",
        htmlContent,
      });
    }

    // Enviar WhatsApp al cliente
    const whatsappMsg = `Hola, *${appointment.client.firstName}*. 🚗\n\nTe confirmamos que tu cita de servicio automotriz para la placa *${appointment.vehicle.plate}* ha sido *CANCELADA* exitosamente.\n\nSi deseas volver a solicitar una cita, puedes hacerlo cuando desees ingresando a tu portal de autogestión.\n\n_Tecnicentro Los Carros_`;
    await sendWhatsAppMessage(appointment.client.phone, whatsappMsg);

    revalidatePath(`/portal/vehiculo/${token}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error al cancelar la cita desde el portal:", error);
    return { error: "Ocurrió un error al cancelar la cita." };
  }
}
