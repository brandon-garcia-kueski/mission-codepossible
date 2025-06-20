# Blocked Slots Feature - Meeting Scheduler

Esta documentación describe la implementación del feature de bloqueo de slots en el Meeting Scheduler, que permite a los usuarios configurar sus preferencias de disponibilidad para evitar programar reuniones en horarios no deseados.

## Características Implementadas

### 1. Respeto a Preferencias de Usuario

#### Horario Laboral
- Configuración de horas de inicio y fin del día laboral
- Solo se mostrarán slots dentro del horario configurado
- Por defecto: 9:00 AM - 5:00 PM

#### Días Laborales
- Configuración de qué días de la semana están disponibles para reuniones
- Ejemplo: Bloquear miércoles ("no meetings wednesday")
- Por defecto: Lunes a Viernes

#### Días de PTO (Paid Time Off)
- Configuración de días específicos completamente bloqueados
- Incluye razón del bloqueo (ej: "Vacaciones", "Día personal")
- Soporte para bloqueos de día completo o por horas específicas

### 2. Configuraciones Avanzadas

#### Tiempo Mínimo de Aviso
- Configurable en horas (por defecto: 2 horas)
- Evita programar reuniones con muy poco tiempo de anticipación

#### Preferencias de Horarios
- Configuración de horarios preferidos (mañana, tarde, tarde-noche)
- Afecta el scoring de los slots disponibles

#### Buffer Time
- Tiempo de separación entre reuniones
- Configurable en minutos (por defecto: 15 minutos)

## Estructura de Archivos

### APIs
- `/api/user/preferences/route.ts` - CRUD de preferencias de usuario
- `/api/calendar/availability/route.ts` - Algoritmo actualizado con bloqueos
- `/api/demo/setup-preferences/route.ts` - Demo con datos de ejemplo

### Páginas
- `/preferences/page.tsx` - Interfaz para configurar preferencias
- `/schedule/page.tsx` - Actualizada para mostrar preferencias activas
- `/test-blocked-slots/page.tsx` - Página de pruebas del feature

### Hooks
- `/hooks/useUserPreferences.ts` - Hook para manejar preferencias

### Tipos
- `/types/calendar.ts` - Interfaces extendidas para preferencias

## Funcionalidad del Algoritmo

### Flujo de Bloqueo de Slots

1. **Verificación de Día Laboral**
   ```typescript
   // Verificar si el día está habilitado en las preferencias semanales
   const dayMapping = { 0: 'sunday', 1: 'monday', ..., 6: 'saturday' }
   const dayName = dayMapping[dayOfWeek]
   return userPreferences.workingDays[dayName]
   ```

2. **Verificación de Días Bloqueados Específicos**
   ```typescript
   // Verificar si hay bloqueos específicos para la fecha
   const isSpecificallyBlocked = userPreferences.blockedDays.some(blockedDay => 
     blockedDay.date === dateString && (blockedDay.allDay !== false)
   )
   ```

3. **Verificación de Horarios Específicos**
   ```typescript
   // Para bloqueos parciales del día
   if (dayBlock.timeRanges) {
     // Verificar overlap con rangos de tiempo bloqueados
   }
   ```

### Scoring Mejorado

El sistema de puntuación ahora considera las preferencias del usuario:

```typescript
function calculateSlotScore(slotStart: Date, userPreferences: UserPreferences): number {
  const hour = slotStart.getHours()
  let score = 40 // Base score

  if (userPreferences.preferredMeetingTimes) {
    if (hour >= 9 && hour < 12 && userPreferences.preferredMeetingTimes.morning) {
      score = 100
    } else if (hour >= 12 && hour < 15 && userPreferences.preferredMeetingTimes.afternoon) {
      score = 80
    } else if (hour >= 15 && hour < 18 && userPreferences.preferredMeetingTimes.evening) {
      score = 60
    }
  }

  return score
}
```

## Ejemplos de Uso

### Configurar Miércoles Bloqueados
```typescript
const preferences: UserPreferences = {
  workingDays: {
    monday: true,
    tuesday: true,
    wednesday: false, // No meetings on Wednesday
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  }
}
```

### Agregar Días de PTO
```typescript
const blockedDays: BlockedDay[] = [
  {
    date: '2025-06-25',
    reason: 'Vacaciones',
    allDay: true
  },
  {
    date: '2025-06-27',
    reason: 'Cita médica',
    allDay: false,
    timeRanges: [
      { start: '14:00', end: '16:00' }
    ]
  }
]
```

### Configurar Horario Laboral
```typescript
const workingHours = {
  start: 9,  // 9 AM
  end: 17    // 5 PM
}
```

## Interfaz de Usuario

### Página de Preferencias (`/preferences`)
- **Horario Laboral**: Selectores para hora de inicio y fin
- **Días Laborales**: Checkboxes para cada día de la semana
- **Tiempo Mínimo de Aviso**: Input numérico en horas
- **Horarios Preferidos**: Checkboxes para mañana/tarde/noche
- **Días Bloqueados**: 
  - Formulario para agregar nuevos bloqueos
  - Lista de bloqueos existentes con opción de eliminar
  - Soporte para bloqueos completos o por horas

### Página de Programación (`/schedule`)
- **Información de Preferencias**: Panel informativo que muestra:
  - Horario laboral actual
  - Días laborales habilitados
  - Número de días bloqueados
  - Tiempo mínimo de aviso
  - Enlace rápido para modificar preferencias

### Página de Pruebas (`/test-blocked-slots`)
- Interfaz para probar la funcionalidad con datos de ejemplo
- Análisis automático de resultados
- Verificación de que los bloqueos se aplican correctamente

## Testing

Para probar el feature:

1. **Configurar Preferencias**:
   - Ir a `/preferences`
   - Configurar días laborales (desactivar miércoles)
   - Agregar días de PTO
   - Configurar horario laboral

2. **Probar Disponibilidad**:
   - Ir a `/schedule`
   - Verificar que se muestre información de preferencias
   - Buscar disponibilidad en un rango que incluya días bloqueados

3. **Testing Automatizado**:
   - Ir a `/test-blocked-slots`
   - Ejecutar test automático con datos de ejemplo
   - Verificar que los resultados respeten los bloqueos

## Casos de Uso Cubiertos

✅ **No meetings on Wednesday**: Configuración de días laborales  
✅ **Horario laboral**: Horarios de inicio y fin personalizables  
✅ **Días de PTO**: Bloqueos específicos por fecha con razones  
✅ **Bloqueos parciales**: Rangos de tiempo específicos bloqueados  
✅ **Tiempo mínimo de aviso**: Prevención de reuniones de último minuto  
✅ **Preferencias de horarios**: Scoring basado en horarios preferidos  

## Mejoras Futuras

- **Persistencia en Base de Datos**: Actualmente las preferencias se almacenan en memoria
- **Bloqueos Recurrentes**: Ej: "Todos los miércoles de 2-3 PM"
- **Integración con Calendarios Externos**: Importar bloqueos desde otros calendarios
- **Notificaciones**: Alertas cuando se intenta programar en horarios bloqueados
- **Plantillas de Preferencias**: Perfiles predefinidos por tipo de trabajo

## Arquitectura Técnica

### Flujo de Datos
1. Usuario configura preferencias → `/api/user/preferences`
2. Sistema busca disponibilidad → `/api/calendar/availability`
3. Algoritmo aplica filtros de bloqueo
4. Se retornan solo slots válidos según preferencias

### Consideraciones de Rendimiento
- Filtrado eficiente en memoria
- Caching de preferencias por sesión
- Límite de slots retornados (top 10)

### Seguridad
- Validación de sesión en todas las APIs
- Preferencias vinculadas al usuario autenticado
- Sanitización de inputs de fecha y hora
