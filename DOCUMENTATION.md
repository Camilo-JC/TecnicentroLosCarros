# 🚗 Documentación Técnica - Tecnicentro Los Carros

## 📌 Descripción General

**Tecnicentro Los Carros** es un Sistema de Gestión Integral de Servicios Automotrices estructurado como una aplicación web moderna. Está diseñado específicamente para optimizar los flujos operativos diarios de un taller automotriz, incluyendo la administración de clientes, el registro del historial de vehículos, el control de servicios prestados, y el agendamiento y notificación inteligente de citas.

---

## 🛠️ Stack Tecnológico

El proyecto está construido bajo una arquitectura robusta y moderna basada en TypeScript:

*   **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) - Utiliza renderizado en el servidor (SSR), Server Actions para la interacción con la base de datos y optimización de recursos.
*   **Base de Datos y ORM**: [Prisma ORM](https://www.prisma.io/) - Abstracción de base de datos relacional y consultas seguras en TypeScript.
*   **Seguridad y Autenticación**: [NextAuth.js v4](https://next-auth.js.org/) - Autenticación basada en sesiones JWT con estrategia de credenciales.
*   **Encriptación**: [bcrypt](https://www.npmjs.com/package/bcrypt) - Hash de contraseñas de operadores en la base de datos.
*   **Estilos y UI**: [Tailwind CSS v4](https://tailwindcss.com/) - Sistema de diseño ágil mediante variables de tema nativas `@theme`.
*   **Manejo de Formularios**: [React Hook Form](https://react-hook-form.com/) junto con resolver de [Zod](https://zod.dev/) para validaciones estrictas tanto en cliente como servidor.
*   **Notificaciones por Correo**: [Brevo API (SMTP/Transactional)](https://www.brevo.com/) - Envío automatizado de correos electrónicos transaccionales.
*   **Animaciones y UI**: [Framer Motion](https://www.framer.com/motion/) para transiciones suaves de página y micro-interacciones; [Lucide React](https://lucide.dev/) para el set de íconos interactivos.

---

## 📂 Estructura de Directorios

El código fuente del proyecto se organiza bajo la carpeta `src/`:

```text
TecnicentroLosCarros/
├── prisma/                  # Ubicación del esquema e historial de migraciones (Ignorado en Git)
├── public/                  # Archivos estáticos (Logos, imágenes de fondo, íconos)
├── src/
│   ├── app/                 # Rutas de la aplicación (Next.js App Router)
│   │   ├── api/             # Endpoints de API de Next.js
│   │   │   └── auth/        # Configuración de los endpoints de NextAuth
│   │   ├── dashboard/       # Panel principal protegido
│   │   │   ├── citas/       # Módulo de gestión y agendamiento de citas
│   │   │   ├── clientes/    # Módulo de gestión de clientes y sus vehículos
│   │   │   ├── servicios/   # Módulo de registro e historial de servicios
│   │   │   ├── layout.tsx   # Menú lateral responsivo y contenedor del panel
│   │   │   └── page.tsx     # Página de bienvenida y alertas del día
│   │   ├── login/           # Pantalla y formulario de inicio de sesión
│   │   ├── globals.css      # Estilos generales y variables de tema de Tailwind v4
│   │   ├── layout.tsx       # Layout raíz del HTML
│   │   └── page.tsx         # Redirección inteligente basada en el estado de autenticación
│   ├── components/          # Componentes transversales reutilizables
│   │   ├── AuthProvider.tsx # Proveedor de contexto para NextAuth (SessionProvider)
│   │   └── PageTransition.tsx # Contenedor animado para cambio de páginas
│   └── lib/                 # Inicializaciones y clientes de librerías externas
│       ├── auth.ts          # Opciones y Callbacks de NextAuth
│       ├── brevo.ts         # Integración y envío de correos con la API de Brevo
│       └── prisma.ts        # Instancia única del cliente de Prisma (Singleton)
├── .env.example             # Ejemplo de variables de configuración requeridas
├── package.json             # Scripts de ejecución y dependencias del proyecto
├── tsconfig.json            # Configuración de compilación de TypeScript
└── README.md                # Presentación de cara al usuario
```

---

## 🗄️ Modelo de Datos (Esquema de Base de Datos)

A partir de las consultas e inserciones mapeadas en las Server Actions de la aplicación, se deduce el siguiente esquema de entidades en Prisma:

### 1. Modelo `User` (Operadores del Sistema)
*   `id`: Identificador único (String - UUID/CUID).
*   `name`: Nombre completo del operador.
*   `username`: Nombre de usuario único (usado para login, en minúsculas).
*   `password`: Hash Bcrypt de la contraseña del operador.
*   `role`: Rol dentro de la aplicación (ej. Admin, Operador).

### 2. Modelo `Client` (Clientes)
*   `id`: Identificador único (String).
*   `firstName`: Nombres del cliente.
*   `lastName`: Apellidos del cliente.
*   `documentId`: Cédula o documento de identidad único.
*   `phone`: Teléfono de contacto.
*   `email`: Correo electrónico (opcional, nullable).
*   `createdAt`: Fecha de registro en el sistema.
*   *Relaciones*: Un cliente tiene muchos `vehicles` (1:N) y tiene muchas citas (`appointments`) (1:N).

### 3. Modelo `Vehicle` (Vehículos)
*   `id`: Identificador único (String).
*   `plate`: Placa del vehículo (Única, almacenada en mayúsculas).
*   `brand`: Marca o línea del carro.
*   `modelYear`: Año del modelo.
*   `clientId`: Referencia al cliente propietario.
*   *Relaciones*: Pertenece a un `client` (N:1). Tiene asociados muchos registros de servicio `ServiceRecord` (1:N) y citas `appointments` (1:N).

### 4. Modelo `ServiceRecord` (Historial de Trabajos)
*   `id`: Identificador único (String).
*   `vehicleId`: Referencia al vehículo en el que se realizó el trabajo.
*   `totalValue`: Monto total cobrado por el servicio (Decimal/Float, manejado en COP).
*   `description`: Comentarios u observaciones adicionales (opcional, nullable).
*   `createdAt`: Fecha y hora de creación.
*   *Relaciones*: Pertenece a un `vehicle` (N:1). Contiene una o más actividades `Activity` (1:N).

### 5. Modelo `Activity` (Actividades de Servicio)
*   `id`: Identificador único (String).
*   `name`: Nombre de la actividad específica (ej. Alineación, Cambio de Aceite).
*   `serviceRecordId`: Relación al registro de servicio contenedor.
*   *Relaciones*: Pertenece a un `ServiceRecord` (N:1).

### 6. Modelo `Appointment` (Citas Agendadas)
*   `id`: Identificador único (String).
*   `clientId`: Referencia al cliente.
*   `vehicleId`: Referencia al vehículo.
*   `scheduledDate`: Fecha programada (DateTime).
*   `scheduledTime`: Hora programada (String, formato HH:MM).
*   `status`: Estado de la cita (Enum/String: `PENDING`, `COMPLETED`, `CANCELLED`).
*   `createdAt`: Fecha de creación de la cita.

---

## ⚙️ Reglas de Negocio y Lógica de Módulos

### 🔒 Autenticación y Seguridad
*   El acceso a las rutas hijas de `/dashboard` requiere una sesión activa. Si no existe, se redirige al operador a la ruta `/login`.
*   El inicio de sesión se realiza en minúsculas en el campo `username` para evitar problemas de case-sensitivity.
*   Al iniciar sesión exitosamente, se añade el rol del usuario (`role`), su `id` y su `username` en el token JWT y en el objeto `session` expuesto al cliente.

### 👥 Clientes y Vehículos
*   **Creación Transaccional**: El cliente y su vehículo inicial se crean en una sola transacción para asegurar la integridad referencial. Si la Cédula (`documentId`) o la Placa (`plate`) ya existen, la base de datos lanza un error de restricción única (`P2002`), el cual es capturado para mostrar un mensaje claro al operador.
*   **Buscador en Tiempo Real**: El campo de búsqueda filtra registros que coincidan parcialmente con la cédula del cliente o la placa del vehículo mediante el operador lógico `OR` de Prisma con modo `insensitive`.

### 🔧 Gestión de Servicios
*   **Actividades**: El sistema permite asociar actividades fijas prestablecidas o dinámicas (personalizadas) creadas en caliente.
*   **Flujo**:
    1. Se busca la placa del vehículo a través de un autocompletador.
    2. Se ingresa el valor total cobrado.
    3. Se guardan las actividades asociadas al registro `ServiceRecord` en una operación anidada (`create`).

### 📅 Agendamiento de Citas
*   **Validaciones de Fecha/Hora**:
    *   No se permite agendar citas en fechas anteriores al día actual.
    *   Las citas deben registrarse dentro del horario laboral de atención: de **8:00 AM a 5:00 PM**.
    *   Las fechas se normalizan (ej. `setHours(12, 0, 0, 0)`) para evitar desfases debido a husos horarios de servidores en la nube.
*   **Notificación por Correo (Brevo)**: Si el cliente posee correo electrónico registrado y se marca la opción de notificar por correo, el sistema invoca el helper `sendEmail` para enviar una plantilla HTML estructurada y con diseño responsivo usando la API de Brevo.
*   **Notificación por WhatsApp**: Si se solicita notificación por WhatsApp y el cliente posee número móvil, el sistema construye una URL de redirección a WhatsApp (`https://wa.me/{telefono}?text={mensaje}`).
    *   Formatea el número con el prefijo internacional de Colombia (`+57`) si cuenta con 10 dígitos.
    *   Codifica el mensaje amigable de confirmación o recordatorio.
*   **Flujo de Estados**: Las citas se listan ordenadas cronológicamente y permiten ser marcadas como Completadas, Canceladas o Reprogramadas mediante Server Actions dedicadas que limpian la caché usando `revalidatePath`.

---

## 🔑 Configuración del Entorno (`.env`)

Para correr este proyecto es necesario crear un archivo `.env` en la raíz con las siguientes claves (consulte [.env.example](file:///c:/Users/camil/Downloads/TecnicentroLosCarros/.env.example)):

```ini
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/tecnicentro?schema=public"
NEXTAUTH_SECRET="tu_secreto_super_seguro_aqui"
NEXTAUTH_URL="http://localhost:3000"
BREVO_API_KEY="tu_brevo_api_key_aqui"
```

---

## 🚀 Guía de Desarrollo Local

### 1. Clonar e Instalar Dependencias
Instale los paquetes de Node.js necesarios en el proyecto:
```bash
npm install
```

### 2. Configurar la Base de Datos
1. Asegúrese de tener PostgreSQL (u otro motor de base de datos) corriendo localmente o en la nube.
2. Cree el archivo `.env` en la raíz y ajuste la variable `DATABASE_URL`.
3. Ejecute las migraciones de Prisma para crear las tablas necesarias:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Genere el cliente local de Prisma:
   ```bash
   npx prisma generate
   ```

### 3. Crear un Operador Inicial (Semilla)
Si posee un archivo de semilla (`prisma/seed.ts` o similar), ejecútelo para crear un operador inicial o inserte un usuario de prueba en la base de datos de manera manual utilizando un hash Bcrypt para el campo `password`.

### 4. Iniciar Servidor de Desarrollo
Corra el servidor de desarrollo local:
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

### 5. Compilación para Producción
Para compilar la aplicación para entornos de producción:
```bash
npm run build
npm start
```
