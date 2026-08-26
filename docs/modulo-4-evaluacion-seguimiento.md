# Módulo 4 — Evaluación y Seguimiento

## Alcance

Este módulo trabaja exclusivamente con la tabla `User_tasks` existente en
MySQL. No crea tablas, no altera el esquema y no implementa notificaciones.
TypeORM permanece configurado con `synchronize: false`.

La funcionalidad cubierta es:

- Registrar la entrega de una actividad antes de su fecha límite.
- Rechazar entregas vencidas y duplicadas.
- Calificar únicamente entregas que ya tienen `Delivery_date`.
- Registrar calificación, fecha de calificación y retroalimentación.
- Consultar entregas por estudiante o actividad.

## Tabla existente

La entidad TypeORM representa el siguiente esquema acordado con el equipo:

| Columna | Tipo | Uso |
|---|---|---|
| `email_User` | `VARCHAR(100)` | Correo del estudiante y parte de la clave primaria. |
| `Id_task` | `INT` | Actividad y parte de la clave primaria. Referencia `tasks.Id_task`. |
| `Qualification` | `DECIMAL(4,2) NULL` | Calificación asignada por el docente. |
| `Delivery_date` | `DATETIME NULL` | Fecha de entrega generada por el servidor. |
| `Qualification_date` | `DATETIME NULL` | Fecha de calificación generada por el servidor. |
| `Feedback_comments` | `VARCHAR(500) NULL` | Retroalimentación docente. |
| `Comment` | `VARCHAR(500) NULL` | Comentario opcional del estudiante. |

La clave primaria compuesta (`email_User`, `Id_task`) impide registrar dos
filas para el mismo estudiante y actividad.

Aunque MySQL contiene una clave foránea hacia `Users.Email`, todavía no se
modela una relación TypeORM con usuarios porque ese módulo no existe en el
código. La relación con `Task` sí se encuentra modelada.

## API

La URL local predeterminada es `http://localhost:3000`.

### Registrar entrega

`POST /user-tasks`

```json
{
  "emailUser": "estudiante@ejemplo.com",
  "idTask": 12,
  "comment": "Resultados de la práctica"
}
```

`Delivery_date` se genera con la fecha del servidor. La entrega se rechaza si
la tarea no existe, está vencida o la clave compuesta ya está registrada.

### Calificar entrega

`PATCH /user-tasks/:idTask/:emailUser/qualification`

```json
{
  "qualification": 4.5,
  "feedbackComments": "Buen procedimiento; revisa las unidades."
}
```

`Qualification_date` se genera con la fecha del servidor. La operación se
rechaza si no existe una fila con `Delivery_date` o si la calificación supera
el `Max_score` de la tarea.

### Consultar por actividad

`GET /user-tasks?taskId=12`

### Consultar por estudiante

`GET /user-tasks?email=estudiante%40ejemplo.com`

Ambos filtros también pueden combinarse. La petición se rechaza si no se
proporciona ninguno.

## Integraciones pendientes

Cuando estén disponibles los demás módulos se deberá:

1. Obtener el correo del estudiante desde la sesión autenticada al entregar.
2. Verificar que el estudiante esté matriculado en el curso de la actividad.
3. Verificar que el usuario que califica sea el docente responsable.
4. Confirmar la política común de zona horaria para las fechas del servidor y
   MySQL.

## Validación con MySQL

Cuando el equipo entregue las credenciales:

1. Copiar `apps/backend/.env.example` como `apps/backend/.env` y completar la
   conexión.
2. Iniciar backend y frontend sin activar `synchronize`.
3. Confirmar que TypeORM reconoce `User_tasks` sin intentar modificarla.
4. Probar una entrega válida, una vencida y una duplicada.
5. Probar que no se pueda calificar sin `Delivery_date`.
6. Probar una calificación válida y otra superior a `Max_score`.
7. Consultar los historiales por correo y por actividad.
8. Ejecutar pruebas, lint y compilación antes del Pull Request.
