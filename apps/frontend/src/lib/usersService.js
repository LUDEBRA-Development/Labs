import { apiClient } from './apiClient'

export const usersService = {
  list: (role) => apiClient.get('/users', { params: role ? { role } : {} }).then((r) => r.data),
  create: (payload) => apiClient.post('/users', payload).then((r) => r.data),
  updateStatus: (id, isActive) =>
    apiClient.patch(`/users/${id}/status`, { isActive }).then((r) => r.data),
}
