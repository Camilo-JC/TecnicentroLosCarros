import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Sembrar Servicios de Mantenimiento
  const defaultServices = [
    { name: "Cambio de Aceite", description: "Cambio de aceite de motor y filtro" },
    { name: "Sincronización", description: "Sincronización de motor para optimizar rendimiento y consumo" },
    { name: "Alineación y Balanceo", description: "Alineación de dirección y balanceo de ruedas de ejes delantero y trasero" },
    { name: "Revisión de Frenos", description: "Inspección, limpieza y cambio de pastillas, discos y líquido de frenos" },
    { name: "Cambio de Correa", description: "Cambio de correa de repartición/distribución o de accesorios" }
  ];

  console.log("Sembrando servicios de mantenimiento...");
  for (const service of defaultServices) {
    await prisma.maintenanceService.upsert({
      where: { name: service.name },
      update: {},
      create: {
        name: service.name,
        description: service.description
      }
    });
  }

  // 2. Sembrar Usuario Operador por defecto si no existe ninguno
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    console.log("Creando usuario administrador inicial...");
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        name: "Administrador Tecnicentro",
        username: "admin",
        password: hashedPassword,
        role: "ADMINISTRADOR"
      }
    });
    console.log("Usuario inicial creado. Usuario: admin, Contraseña: admin123");
  }

  console.log("Semilla sembrada exitosamente.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
