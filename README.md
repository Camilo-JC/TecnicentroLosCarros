# 🚗 Tecnicentro Los Carros

**Sistema de Gestión Integral de Servicios Automotrices**

Plataforma web diseñada para administrar de manera eficiente las operaciones diarias del taller: clientes, vehículos, servicios y citas.

---

## 🔐 Inicio de Sesión

Al ingresar al sistema se solicita un **usuario** y **contraseña**. Solo los operadores autorizados pueden acceder al panel de administración.

---

## 📋 Módulos del Sistema

### 👥 Clientes y Vehículos

Permite registrar la información de cada cliente junto con su vehículo:

- **Datos del cliente:** Nombres, apellidos, cédula, teléfono y correo electrónico (opcional).
- **Datos del vehículo:** Placa, marca y año.
- La **cédula** y la **placa** son únicas — el sistema no permite duplicados.
- Incluye un **buscador en tiempo real**: al escribir parte de una cédula o placa, los resultados aparecen automáticamente sin necesidad de presionar ningún botón.

---

### 🔧 Servicios Realizados

Registra los trabajos efectuados a cada vehículo:

1. Se busca el vehículo escribiendo la **placa** o la **cédula** del propietario.
2. Se seleccionan las **actividades realizadas** de una lista predefinida:
   - Sincronización, cambio de aceite, alineación, balanceo, revisión de frenos, revisión de suspensión, scanner, montaje de llanta, nitrógeno, latonería, pintura, entre otros.
   - También se pueden agregar **actividades personalizadas** que no estén en la lista.
3. Se ingresa el **valor total en pesos colombianos (COP)** cobrado por el conjunto de servicios.
4. Opcionalmente se puede agregar una descripción con observaciones o recomendaciones.

El historial de servicios cuenta con un **filtro por cédula o placa**, permitiendo consultar fácilmente todos los trabajos realizados a un vehículo en particular y en qué fechas.

---

### 📅 Agendamiento de Citas

Permite programar citas de atención para los clientes:

1. Se busca el vehículo por **placa** o **cédula**.
2. Se selecciona la **fecha** (no se permiten fechas anteriores al día actual) y la **hora** (horario de atención: 8:00 AM a 5:00 PM).
3. Se eligen las **opciones de notificación**:
   - **Correo electrónico:** Si el cliente tiene correo registrado, recibirá automáticamente un mensaje de confirmación.
   - **WhatsApp:** Se abrirá WhatsApp con un mensaje predefinido listo para enviar al número del cliente.

#### Gestión de Citas

Desde el panel de citas se puede:

- **Recordar:** Envía un mensaje de recordatorio por WhatsApp al cliente con la hora de su cita.
- **Reprogramar:** Cambia la fecha y hora de una cita existente sin necesidad de cancelarla.
- **Completar:** Marca la cita como atendida.
- **Cancelar:** Cancela la cita.

---

### 🏠 Pantalla de Inicio

Al ingresar al sistema, la pantalla principal muestra:

- Un **saludo personalizado** con el nombre del operador.
- **Alertas del día:** Si hay citas programadas para la fecha actual, aparecerá una notificación destacada indicando cuántas citas hay pendientes, con el detalle de cada una (hora, vehículo y cliente).

---

## 📄 Licencia

Desarrollado para **Tecnicentro Los Carros** — *La mejor decisión para su carro y usted.*
