const API_BASE = 'http://localhost:3000'

export async function getCourses() {
  const res = await fetch(`${API_BASE}/courses`)
  if (!res.ok) throw new Error('Error al cargar cursos')
  return res.json()
}

export async function getCourse(id) {
  const res = await fetch(`${API_BASE}/courses/${id}`)
  if (!res.ok) {
    if (res.status === 404) throw new Error('Curso no encontrado')
    throw new Error('Error al cargar el curso')
  }
  return res.json()
}

export async function createCourse(data) {
  const res = await fetch(`${API_BASE}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message?.[0] || 'Error al crear el curso')
  }
  return res.json()
}

export async function updateCourse(id, data) {
  const res = await fetch(`${API_BASE}/courses/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message?.[0] || 'Error al actualizar el curso')
  }
  return res.json()
}

export async function deleteCourse(id) {
  const res = await fetch(`${API_BASE}/courses/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Error al eliminar el curso')
}
