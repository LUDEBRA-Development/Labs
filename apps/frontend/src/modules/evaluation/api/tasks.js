const MOCK_DELAY_MS = 250;

export const MOCK_COURSE = {
  idCourse: "FIS101",
  name: "Electromagnetismo I",
  code: "FIS-204",
};

const mockTasks = [
  {
    idTask: 101,
    name: "Laboratorio de condensadores",
    descriptions: "Calcular capacitancia equivalente, carga y energía.",
    creationDate: "2026-08-10T08:00:00-05:00",
    expirationDate: "2026-09-15T23:59:59-05:00",
    maxScore: 5,
    periodId: 1,
    createdById: "docente@unicesar.edu.co",
  },
  {
    idTask: 102,
    name: "Circuitos y Ley de Ohm",
    descriptions:
      "Analizar corriente, voltaje y resistencia en un circuito mixto.",
    creationDate: "2026-08-12T08:00:00-05:00",
    expirationDate: "2026-09-20T23:59:59-05:00",
    maxScore: 10,
    periodId: 1,
    createdById: "docente@unicesar.edu.co",
  },
  {
    idTask: 103,
    name: "Campo eléctrico",
    descriptions: "Representar líneas de campo y calcular su intensidad.",
    creationDate: "2026-08-01T08:00:00-05:00",
    expirationDate: "2026-08-20T23:59:59-05:00",
    maxScore: 5,
    periodId: 1,
    createdById: "docente@unicesar.edu.co",
  },
];

function resolveMock(value) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(structuredClone(value)), MOCK_DELAY_MS);
  });
}

// Integración futura: reemplazar únicamente esta función por GET /tasks
// usando el filtro de curso/período acordado con TasksModule.
export function getTasksByCourse(idCourse) {
  if (idCourse !== MOCK_COURSE.idCourse) return resolveMock([]);
  return resolveMock(mockTasks);
}

// Integración futura: reemplazar únicamente esta función por GET /tasks/:idTask.
export async function getTaskById(idTask) {
  const task = mockTasks.find((item) => item.idTask === Number(idTask));
  if (!task) throw new Error(`Actividad ${idTask} no encontrada`);
  return resolveMock(task);
}
