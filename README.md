# 🚗 Tecnicentro Los Carros

**Sistema de Gestión Integral de Servicios Automotrices**

Aplicación web completa para la administración de un taller automotriz, que permite gestionar clientes, vehículos, servicios realizados y agendamiento de citas con notificaciones automáticas por correo electrónico y WhatsApp.

---

## ✨ Funcionalidades

### 🔐 Autenticación
- Acceso restringido con sistema de login seguro (contraseñas encriptadas con bcrypt).
- Tres usuarios operadores preconfigurados.
- Protección de rutas del dashboard mediante sesiones de NextAuth.

### 👥 Gestión de Clientes y Vehículos
- Registro de clientes con: nombre, apellido, cédula (única), teléfono y correo electrónico (opcional).
- Registro de vehículos asociados: placa (única), marca y año.
- **Búsqueda en tiempo real** (sin botón de buscar) por cédula o placa, con resultados instantáneos.

### 🔧 Registro de Servicios
- Registro manual de servicios realizados a cada vehículo.
- Selección de actividades predefinidas: sincronización, cambio de aceite, alineación, balanceo, revisión de frenos, revisión de suspensión, scanner, montaje de llanta, nitrógeno, latonería, pintura, entre otros.
- Posibilidad de agregar actividades personalizadas.
- Registro de un **valor total** (COP) correspondiente al conjunto de servicios efectuados.
- Descripción/observaciones opcionales.
- **Filtro por cédula o placa** en el historial de servicios para consultar el historial de mantenimiento de cada vehículo.

### 📅 Agendamiento de Citas
- Programación de citas asociadas a un cliente y vehículo.
- Restricción de fechas (no se permite agendar en días pasados).
- Horario de atención configurable: **8:00 AM a 5:00 PM**.
- Estados de cita: Pendiente, Completada, Cancelada.
- **Opción de reprogramar** citas directamente desde el panel.
- **Alertas en el Dashboard**: notificación visible de las citas programadas para el día en curso.

### 📩 Notificaciones
- **Correo electrónico** (Brevo/Sendinblue): confirmación automática de cita al cliente si tiene correo registrado.
- **WhatsApp**: generación automática de mensaje de confirmación y de recordatorio con un solo clic, listo para enviar al número del cliente.

---

## 🛠️ Tecnologías Utilizadas

| Categoría | Tecnología |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Lenguaje** | TypeScript |
| **Base de Datos** | PostgreSQL ([Neon](https://neon.tech/)) |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **Autenticación** | [NextAuth.js](https://next-auth.js.org/) |
| **Estilos** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Animaciones** | [Framer Motion](https://www.framer.com/motion/) |
| **Correos** | [Brevo (Sendinblue) API](https://www.brevo.com/) |
| **Validación** | Zod + React Hook Form |
| **Iconos** | [Lucide React](https://lucide.dev/) |
| **Despliegue** | [Vercel](https://vercel.com/) |

---

## 📂 Estructura del Proyecto

```
src/
├── app/
│   ├── api/auth/         # API de autenticación (NextAuth)
│   ├── login/            # Página de inicio de sesión
│   ├── dashboard/        # Panel principal (protegido)
│   │   ├── clientes/     # CRUD de clientes y vehículos
│   │   ├── servicios/    # Registro y consulta de servicios
│   │   └── citas/        # Agendamiento y gestión de citas
│   ├── globals.css       # Estilos globales y paleta de colores
│   └── layout.tsx        # Layout raíz con AuthProvider
├── components/           # Componentes reutilizables
├── lib/
│   ├── auth.ts           # Configuración de NextAuth
│   ├── prisma.ts         # Cliente Prisma (singleton)
│   └── brevo.ts          # Integración con API de Brevo
prisma/
├── schema.prisma         # Modelos de la base de datos
└── seed.js               # Script de semilla (usuarios iniciales)
```

---

## 🗄️ Modelo de Datos

```mermaid
erDiagram
    User {
        string id PK
        string name
        string username UK
        string password
        string role
    }
    Client {
        string id PK
        string firstName
        string lastName
        string documentId UK
        string phone
        string email
    }
    Vehicle {
        string id PK
        string plate UK
        string brand
        string modelYear
        string clientId FK
    }
    ServiceRecord {
        string id PK
        string vehicleId FK
        float totalValue
        string description
        datetime date
    }
    ServiceActivity {
        string id PK
        string serviceRecordId FK
        string name
    }
    Appointment {
        string id PK
        string clientId FK
        string vehicleId FK
        datetime scheduledDate
        string scheduledTime
        string status
    }

    Client ||--o{ Vehicle : "posee"
    Client ||--o{ Appointment : "agenda"
    Vehicle ||--o{ ServiceRecord : "recibe"
    Vehicle ||--o{ Appointment : "tiene"
    ServiceRecord ||--o{ ServiceActivity : "incluye"
```

---

## 🚀 Instalación y Configuración Local

### Requisitos Previos
- [Node.js](https://nodejs.org/) v18 o superior
- Una base de datos PostgreSQL (se recomienda [Neon](https://neon.tech/) para desarrollo gratuito en la nube)
- Cuenta en [Brevo](https://www.brevo.com/) (gratuita) para el envío de correos

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Camilo-JC/TecnicentroLosCarros.git
   cd TecnicentroLosCarros
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   Crear un archivo `.env` en la raíz del proyecto:
   ```env
   DATABASE_URL="postgresql://usuario:contraseña@host/base_de_datos?sslmode=require"
   BREVO_API_KEY="tu-api-key-de-brevo"
   NEXTAUTH_SECRET="una-clave-secreta-segura"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Sincronizar la base de datos**
   ```bash
   npx prisma db push
   ```

5. **Crear usuarios iniciales**
   ```bash
   node prisma/seed.js
   ```

6. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

7. Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

---

## 👤 Usuarios por Defecto

| Usuario | Contraseña |
|---------|------------|
| `soraida` | `123456` |
| `ana` | `123456` |
| `linda` | `123456` |

> ⚠️ **Importante:** Cambia las contraseñas en un entorno de producción.

---

## 🌐 Despliegue en Vercel

1. Importar el repositorio desde [vercel.com](https://vercel.com/).
2. Configurar las variables de entorno (`DATABASE_URL`, `BREVO_API_KEY`, `NEXTAUTH_SECRET`).
3. Vercel ejecutará automáticamente `prisma generate` gracias al script `postinstall`.
4. Hacer deploy — la aplicación estará disponible en la URL asignada.

---

## 📄 Licencia

Este proyecto fue desarrollado como solución de gestión interna para **Tecnicentro Los Carros**.

---

## 👨‍💻 Autor

**Camilo JC** — [GitHub](https://github.com/Camilo-JC)
