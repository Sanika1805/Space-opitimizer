const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function headers(includeAuth = true) {
  const h = { 'Content-Type': 'application/json' };
  if (includeAuth && getToken()) h.Authorization = `Bearer ${getToken()}`;
  return h;
}

export const authApi = {
  register: (data) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: headers(false),
      body: JSON.stringify(data)
    }).then((r) => r.json()),
  login: (data) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: headers(false),
      body: JSON.stringify(data)
    }).then((r) => r.json()),
  getMe: () =>
    fetch(`${API_BASE}/auth/me`, { headers: headers() }).then((r) => r.json())
};

export const drivesApi = {
  list: (params) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/drives${q ? '?' + q : ''}`).then((r) => r.json());
  },
  getById: (id) => fetch(`${API_BASE}/drives/${id}`).then((r) => r.json()),
  join: (id) =>
    fetch(`${API_BASE}/drives/${id}/join`, { method: 'POST', headers: headers() }).then((r) => r.json()),
  leave: (id) =>
    fetch(`${API_BASE}/drives/${id}/leave`, { method: 'POST', headers: headers() }).then((r) => r.json())
};

export const locationsApi = {
  list: (params) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/locations${q ? '?' + q : ''}`).then((r) => r.json());
  },
  priority: (params) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/locations/priority${q ? '?' + q : ''}`).then((r) => r.json());
  }
};

export const scoringApi = {
  getMyScore: () =>
    fetch(`${API_BASE}/scoring`, { headers: headers() }).then((r) => r.json()),
  submitDriveWork: (data) =>
    fetch(`${API_BASE}/scoring/drive`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    }).then((r) => r.json()),
  completeHabit: (points) =>
    fetch(`${API_BASE}/scoring/habit`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ points })
    }).then((r) => r.json()),
  updatePreferredTime: (preferredTimePoll) =>
    fetch(`${API_BASE}/scoring/preferred-time`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ preferredTimePoll })
    }).then((r) => r.json())
};

export const aiApi = {
  dailyHabit: () => fetch(`${API_BASE}/ai/habit/daily`).then((r) => r.json()),
  priorityLocations: (params) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/ai/locations/priority${q ? '?' + q : ''}`).then((r) => r.json());
  },
  emergencyActions: (query) =>
    fetch(`${API_BASE}/ai/emergency`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ query })
    }).then((r) => r.json())
};

export const inchargesApi = {
  getProfile: () =>
    fetch(`${API_BASE}/incharges/profile`, { headers: headers() }).then((r) => r.json()),
  apply: (data) =>
    fetch(`${API_BASE}/incharges/apply`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    }).then((r) => r.json())
};
