# Chat Assistant para Programación de Reuniones

## 🚀 Funcionalidades

El Chat Assistant es una interfaz conversacional que permite a los usuarios programar reuniones usando lenguaje natural. Utiliza IA para extraer automáticamente la información necesaria de los mensajes del usuario.

### ✨ Características principales:

1. **Extracción Inteligente de Datos**: 
   - Extrae automáticamente títulos, participantes, fechas, duración y descripción
   - Entiende formatos naturales como "mañana", "próxima semana", "1 hora", etc.
   - Reconoce emails en el texto y los convierte en participantes

2. **Conversación Guiada**:
   - Hace preguntas específicas para obtener información faltante
   - Confirma los datos extraídos antes de proceder
   - Guía al usuario paso a paso hasta completar todos los campos requeridos

3. **Integración Completa**:
   - Utiliza las mismas APIs que el formulario tradicional
   - Busca horarios disponibles automáticamente
   - Crea reuniones en Google Calendar
   - Envía invitaciones a todos los participantes

## 🎯 Casos de Uso

### Ejemplo de conversación:

**Usuario**: "Hola, necesito programar una reunión"
**Assistant**: "👋 ¡Perfecto! Te ayudo a programar tu reunión. ¿Cuál será el título de la reunión?"

**Usuario**: "Reunión de planificación Q1 con juan@empresa.com y ana@startup.co para mañana 1 hora"
**Assistant**: "✅ ¡Excelente! He extraído la información:
- 📝 Título: Reunión de planificación Q1
- 👥 Participantes: juan@empresa.com, ana@startup.co
- ⏱️ Duración: 1 hora
- 📅 Fecha: mañana

¿Quieres que busque los horarios disponibles?"

**Usuario**: "Sí, por favor"
**Assistant**: "🔍 Buscando horarios disponibles... ✅ ¡Encontré 3 horarios disponibles! Selecciona el que mejor te funcione:"
*[Muestra opciones de horarios]*

## 🛠️ Arquitectura

### Componentes principales:

1. **`/app/chat/page.tsx`**: Página principal del chat assistant
2. **`/components/ChatAssistant.tsx`**: Componente de interfaz del chat
3. **`/hooks/useChatAssistant.ts`**: Hook para manejar la lógica del chat
4. **`/lib/chatMeetingService.ts`**: Servicio para extracción de datos y lógica de negocio
5. **`/app/api/chat/assistant/route.ts`**: API endpoint para procesar mensajes
6. **`/lib/llmService.ts`**: Servicio de IA (Gemini) con métodos de chat

### Flujo de datos:

1. Usuario escribe mensaje → `ChatAssistant`
2. `useChatAssistant` envía mensaje → API `/chat/assistant`
3. API usa `chatMeetingService` para extraer datos
4. `chatMeetingService` usa `llmService` para análisis con IA
5. Respuesta se genera y se envía de vuelta
6. Si datos están completos → busca horarios disponibles
7. Usuario selecciona horario → crea reunión

## 🔧 Configuración

### Variables de entorno requeridas:
```
GEMINI_API_KEY=tu_api_key_de_gemini
```

### Dependencias:
- `@google/generative-ai`: Para integración con Gemini
- `next-auth`: Para autenticación
- Hooks existentes: `useMeetingScheduler`, `useGoogleContacts`

## 📱 Acceso

El Chat Assistant está disponible desde:
1. **Dashboard**: Botón "🤖 Chat Assistant" 
2. **Página de Schedule**: Botón "🤖 Chat IA" en el header
3. **Acceso directo**: `/chat`

## 🎨 UX/UI

- **Diseño conversacional**: Burbujas de chat diferenciadas por usuario/assistant
- **Confirmaciones visuales**: Muestra información extraída en tiempo real
- **Selección interactiva**: Botones para seleccionar horarios disponibles
- **Estados de carga**: Indicadores mientras procesa mensajes
- **Responsive**: Funciona bien en móvil y desktop

## 🧠 Inteligencia Artificial

### Capacidades del LLM:

1. **Extracción de entidades**: Identifica y extrae información estructurada
2. **Manejo de contexto**: Mantiene el contexto de la conversación
3. **Generación de respuestas**: Crea respuestas naturales y útiles
4. **Validación de datos**: Identifica campos faltantes o incorrectos
5. **Fallback inteligente**: Si la IA falla, usa patrones regex como respaldo

### Prompts optimizados para:
- Extracción precisa de datos de reuniones
- Generación de respuestas conversacionales en español
- Manejo de diferentes formatos de fecha y tiempo
- Validación de emails y datos de contacto

## 🔄 Estados del Chat

1. **`collecting_info`**: Recopilando información de la reunión
2. **`showing_slots`**: Mostrando horarios disponibles
3. **`confirming`**: Confirmando selección de horario
4. **`completed`**: Reunión creada exitosamente

## 📞 Soporte

El sistema incluye manejo robusto de errores:
- Fallbacks automáticos si la IA no está disponible
- Validación de datos en múltiples niveles
- Mensajes de error amigables para el usuario
- Recuperación automática de errores temporales
