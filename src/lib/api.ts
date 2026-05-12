const API_URL = 'https://chargehub-backend-production.up.railway.app/api'



// ==================== STATIONS ====================

export async function getStations() {
  const res = await fetch(`${API_URL}/stations`)
  if (!res.ok) throw new Error('Erreur chargement stations')
  return res.json()
}

export async function getStation(id: string) {
  const res = await fetch(`${API_URL}/stations/${id}`)
  if (!res.ok) throw new Error('Station introuvable')
  return res.json()
}

export async function createStation(data: any) {
  const res = await fetch(`${API_URL}/stations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Erreur création station')
  return res.json()
}

export async function updateStation(id: string, data: any) {
  const res = await fetch(`${API_URL}/stations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Erreur modification station')
  return res.json()
}

export async function deleteStation(id: string) {
  const res = await fetch(`${API_URL}/stations/${id}`, {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error('Erreur suppression station')
  return res.json()
}

// ==================== BOOKINGS ====================

export async function getBookings(userId: string) {
  const res = await fetch(`${API_URL}/bookings/${userId}`)
  if (!res.ok) throw new Error('Erreur chargement bookings')
  return res.json()
}

export async function createBooking(data: any) {
  const res = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Erreur création booking')
  return res.json()
}

export async function updateBooking(id: string, data: any) {
  const res = await fetch(`${API_URL}/bookings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Erreur modification booking')
  return res.json()
}

// ==================== SESSIONS ====================

export async function getSessions(userId: string) {
  const res = await fetch(`${API_URL}/sessions/${userId}`)
  if (!res.ok) throw new Error('Erreur chargement sessions')
  return res.json()
}

export async function createSession(data: any) {
  const res = await fetch(`${API_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Erreur création session')
  return res.json()
}

// ==================== USERS ====================

export async function syncUser(data: {
  keycloakId: string
  email: string
  username: string
  role: string
}) {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Erreur sync utilisateur')
  return res.json()
}