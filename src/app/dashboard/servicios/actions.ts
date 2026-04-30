"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getServices(query: string = "") {
  return await prisma.serviceRecord.findMany({
    where: {
      vehicle: {
        OR: [
          { plate: { contains: query, mode: 'insensitive' } },
          { client: { documentId: { contains: query, mode: 'insensitive' } } }
        ]
      }
    },
    include: {
      vehicle: {
        include: {
          client: true
        }
      },
      activities: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createService(formData: FormData, activities: string[]) {
  const vehicleId = formData.get("vehicleId") as string;
  const totalValueStr = formData.get("totalValue") as string;
  const description = formData.get("description") as string;

  if (!vehicleId || !totalValueStr || activities.length === 0) {
    return { error: "Faltan campos obligatorios. Debes seleccionar al menos una actividad." };
  }

  const totalValue = parseFloat(totalValueStr);
  if (isNaN(totalValue)) {
    return { error: "El valor total debe ser un número válido." };
  }

  try {
    await prisma.serviceRecord.create({
      data: {
        vehicleId,
        totalValue,
        description: description || null,
        activities: {
          create: activities.map(name => ({ name }))
        }
      }
    });

    revalidatePath("/dashboard/servicios");
    return { success: true };
  } catch (error: any) {
    return { error: "Ocurrió un error al registrar el servicio." };
  }
}

export async function searchVehiclesByPlate(query: string) {
  if (!query) return [];
  return await prisma.vehicle.findMany({
    where: {
      OR: [
        { plate: { contains: query, mode: 'insensitive' } },
        { client: { documentId: { contains: query, mode: 'insensitive' } } }
      ]
    },
    include: {
      client: true
    },
    take: 5
  });
}
