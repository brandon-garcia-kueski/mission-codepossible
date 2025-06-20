# Función "Bloquear Slot" - Documentación

## Características Implementadas

### 1. **Gestión de Preferencias de Usuario**
- **Horarios de Trabajo**: Define tu horario laboral (ej. 9:00 - 17:00)
- **Días Bloqueados**: Selecciona días completos sin reuniones (ej. no reuniones los miércoles)
- **Zona Horaria**: Configuración automática basada en el navegador

### 2. **Bloqueo de Horarios Específicos**
- **Bloqueos Únicos**: Para eventos específicos como vacaciones o citas médicas
- **Bloqueos Recurrentes**: 
  - Diario (ej. almuerzo 12:00-13:00 todos los días)
  - Semanal (ej. no reuniones los miércoles)
  - Mensual (ej. revisión mensual el primer viernes)

### 3. **Configuración Avanzada de Recurrencia**
- **Intervalo personalizable**: Cada N días/semanas/meses
- **Días específicos**: Para recurrencia semanal, selecciona días específicos
- **Fecha de finalización**: Define cuándo termina la recurrencia
- **Activación/Desactivación**: Pausar temporalmente sin eliminar

## Ejemplos de Uso

### Caso 1: "No reuniones los miércoles"
```
Título: No reuniones los miércoles
Fecha inicio: 2025-06-20
Fecha fin: 2025-12-31
Hora inicio: 00:00
Hora fin: 23:59
Recurrencia: Semanal, cada 1 semana, miércoles
```

### Caso 2: "Almuerzo diario"
```
Título: Almuerzo
Fecha inicio: 2025-06-20
Fecha fin: 2025-12-31
Hora inicio: 12:00
Hora fin: 13:00
Recurrencia: Diario, cada 1 día
```

### Caso 3: "Focus time viernes por la mañana"
```
Título: Focus Time - Desarrollo
Fecha inicio: 2025-06-20
Fecha fin: 2025-12-31
Hora inicio: 09:00
Hora fin: 11:00
Recurrencia: Semanal, cada 1 semana, viernes
```

## Integración con Calendario

### Verificación de Disponibilidad
La función de disponibilidad ahora considera:

1. **Horarios de trabajo del usuario**
2. **Días bloqueados**
3. **Horarios específicos bloqueados**
4. **Recurrencias activas**
5. **Eventos existentes en Google Calendar**

### Algoritmo de Puntuación
Los slots disponibles reciben puntuaciones basadas en:
- Horarios preferidos (mañanas = puntuación alta)
- Conflictos con asistentes opcionales
- Proximidad a horarios bloqueados

## Arquitectura Técnica

### Frontend
- **Hook personalizado** (`useUserPreferences`) para gestión de estado
- **Componentes React** modulares y reutilizables
- **Validación client-side** para mejor UX

### Backend
- **API RESTful** para CRUD de preferencias
- **Integración con Google Calendar API**
- **Lógica de recurrencia** avanzada
- **Storage en memoria** (preparado para base de datos)

### Tipos TypeScript
```typescript
interface UserPreferences {
  blockedDays: number[] // 0=Domingo, 1=Lunes, etc.
  workingHours: { start: number, end: number }
  blockedTimeSlots: BlockedTimeSlot[]
  timeZone: string
}

interface BlockedTimeSlot {
  title: string
  start: string
  end: string
  recurrence?: RecurrenceRule
  isActive: boolean
}
```

## Navegación

### Nueva página de preferencias
- **URL**: `/preferences`
- **Acceso**: Desde el menú principal "⚙️ Preferencias"
- **Pestañas**:
  - Preferencias Generales (horarios de trabajo, días bloqueados)
  - Bloquear Horarios (gestión de slots específicos)

## Beneficios

1. **Flexibilidad**: Diferentes tipos de bloqueos para diferentes necesidades
2. **Automatización**: Recurrencias eliminan configuración manual repetitiva
3. **Control granular**: Activar/desactivar sin perder configuración
4. **Integración completa**: Respeta preferencias en toda la aplicación
5. **UX mejorada**: Interfaz intuitiva y feedback visual claro

## Casos de Uso Empresariales

- **Trabajo remoto**: Horarios flexibles por ubicación
- **Reuniones cross-timezone**: Respeto de horarios locales
- **Productividad**: Focus time y bloques de trabajo profundo
- **Work-life balance**: Días libres y horarios personales
- **Eventos regulares**: Reuniones recurrentes del equipo
