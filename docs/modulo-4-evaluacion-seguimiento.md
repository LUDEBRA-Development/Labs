# Módulo 4 — Evaluación y Seguimiento

## Estado actual

El módulo está implementado en la rama `feat/evaluacion-seguimiento`. Puede
compilarse y probarse sin una base de datos mediante pruebas unitarias, pero la
validación integral queda pendiente hasta que el equipo entregue una instancia
MySQL y confirme el modelo definitivo de usuarios, cursos y matrículas.

## Funcionalidad implementada

- Registrar una entrega de estudiante antes o exactamente en la fecha límite.
- Rechazar entregas vencidas y entregas duplicadas.
- Registrar calificación, fecha de calificación y retroalimentación docente.
- Impedir la calificación cuando no existe una entrega previa.
- Impedir calificaciones superiores al puntaje máximo de la actividad.
- Consultar el historial de un estudiante y las entregas de una actividad.
- Crear un recordatorio interno para el docente cuando vence una actividad.
- Marcar los recordatorios como leídos.

## Modelo de datos

La migración `1787702400000-create-evaluation-tracking.ts` crea las tablas
`User_tasks` y `notifications`.

### `User_tasks`

| Columna | Uso |
|---|---|
| `email_User` | Correo del estudiante. Forma parte de la clave primaria. |
| `Id_task` | Actividad entregada. Forma parte de la clave primaria y referencia `tasks.Id_task`. |
| `Qualification` | Calificación, inicialmente nula. |
| `Delivery_date` | Fecha real de entrega. |
| `Qualification_date` | Fecha en la que el docente calificó. |
| `Feedback_comment` | Retroalimentación obligatoria al calificar. |
| `Comment` | Comentario opcional del estudiante. |

La clave compuesta (`email_User`, `Id_task`) impide que un estudiante registre
dos entregas para la misma actividad.

### `notifications`

Guarda recordatorios internos por actividad, destinatario, tipo y fecha límite.
También conserva el número de entregas y cuántas estaban pendientes de
calificar cuando se creó el aviso.

El backend revisa cada minuto las actividades vencidas. Si estuvo detenido en
el momento exacto del vencimiento, generará el recordatorio cuando vuelva a
estar disponible.

## API disponible

La URL base local predeterminada es `http://localhost:3000`.

### Registrar una entrega

`POST /user-tasks/:taskId/deliver`

```json
{
  "emailUser": "estudiante@ejemplo.com",
  "comment": "Resultados de la práctica"
}
```

### Calificar una entrega

`PATCH /user-tasks/:taskId/users/:emailUser/grade`

```json
{
  "qualification": 4.5,
  "feedbackComment": "Buen procedimiento; revisa las unidades del resultado."
}
```

### Consultas

- `GET /user-tasks/users/:emailUser/history`: historial del estudiante.
- `GET /user-tasks/tasks/:taskId`: entregas de una actividad.
- `GET /user-tasks/:taskId/users/:emailUser`: entrega individual.
- `GET /notifications?recipientEmail=:email&onlyUnread=true`: recordatorios del docente.
- `PATCH /notifications/:id/read`: marca un recordatorio como leído; recibe
  `recipientEmail` en el cuerpo.

## Decisiones pendientes con los otros módulos

Antes de integrar a `develop`, el equipo debe confirmar:

1. Si Personas conservará el correo como identificador o tendrá un identificador
   interno. Actualmente `email_User` todavía no tiene clave foránea porque el
   Módulo 1 no está disponible.
2. Cómo se obtendrá el docente responsable. Actualmente `tasks.created_by` se
   trata como un correo y la creación de tareas usa temporalmente
   `docente@ejemplo.com`.
3. Cómo se comprobará que el estudiante está matriculado en el curso asociado a
   la actividad.
4. Si toda actividad debe tener una fecha límite obligatoria. El modelo actual
   permite que `Expiration_date` sea nula.
5. La zona horaria oficial para almacenar y comparar fechas. Se recomienda
   guardar en UTC y convertir a `America/Bogota` únicamente para mostrarla.
6. Quién ejecutará las migraciones en desarrollo, pruebas y producción.

Cuando exista autenticación, el correo del estudiante o docente deberá salir de
la sesión iniciada y no de parámetros escritos manualmente en la interfaz.

## Validación cuando MySQL esté disponible

1. Copiar `apps/backend/.env.example` como `apps/backend/.env` y completar las
   credenciales.
2. Ejecutar `pnpm --filter backend migration:run` desde la raíz.
3. Confirmar la creación de `User_tasks` y `notifications`, sus claves y la
   relación con `tasks`.
4. Probar una entrega antes de vencer, una entrega vencida y una duplicada.
5. Probar que no se pueda calificar sin entrega ni superar `Max_score`.
6. Calificar una entrega y comprobar el historial con la retroalimentación.
7. Crear una actividad que venza en pocos minutos y comprobar que aparezca un
   único recordatorio para el docente.
8. Ejecutar las pruebas y compilaciones de backend y frontend.

La migración se revierte con `pnpm --filter backend migration:revert` únicamente
en entornos donde sea seguro eliminar las tablas del módulo.
