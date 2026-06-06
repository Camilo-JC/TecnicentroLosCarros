"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getClients(query: string = "") {
  return await prisma.client.findMany({
    where: {
      OR: [
        { documentId: { contains: query, mode: 'insensitive' } },
        { vehicles: { some: { plate: { contains: query, mode: 'insensitive' } } } }
      ]
    },
    include: {
      vehicles: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createClientWithVehicle(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const documentId = formData.get("documentId") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;
  
  const plate = formData.get("plate") as string;
  const brand = formData.get("brand") as string;
  const model = formData.get("model") as string;
  const modelYear = formData.get("modelYear") as string;

  try {
    await prisma.client.create({
      data: {
        firstName,
        lastName,
        documentId,
        phone,
        email: email || null,
        address: address || null,
        vehicles: {
          create: {
            plate: plate.toUpperCase(),
            brand,
            model,
            modelYear
          }
        }
      }
    });

    revalidatePath("/dashboard/clientes");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "La cédula o la placa ya se encuentran registradas." };
    }
    return { error: "Ocurrió un error al registrar el cliente." };
  }
}
