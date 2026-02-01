const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function headers(includeAuth = true) {
  const h = { 'Content-Type': 'application/json' };
  if (includeAuth && getToken()) h.Authorization = `Bearer ${getToken()}`;
  return h;
}

async function parseJsonResponse(r, text) {
  const body = text ?? await r.text();
  try {
    const data = body ? JSON.parse(body) : {};
    if (!r.ok) throw new Error(data.message || r.statusText || 'Request failed');
    return data;
  } catch (e) {
    if (e instanceof SyntaxError || (body && typeof body === 'string' && body.trimStart().startsWith('<')))
      throw new Error('Backend returned an invalid response. Make sure the backend server is running on port 5000.');
    throw e;
  }
}

export const authApi = {
  register: (data) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: headers(false),
      body: JSON.stringify(data)
    }).then((r) => r.text().then((t) => parseJsonResponse(r, t))),
  login: (data) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: headers(false),
      body: JSON.stringify(data)
    }).then((r) => r.text().then((t) => parseJsonResponse(r, t))),
  getMe: () =>
    fetch(`${API_BASE}/auth/me`, { headers: headers() }).then((r) => r.text().then((t) => parseJsonResponse(r, t))),
  updateProfile: (data) =>
    fetch(`${API_BASE}/auth/profile`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify(data)
    }).then((r) => r.text().then((t) => parseJsonResponse(r, t)))
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
    }).then((r) => r.json()),
  submitVerification: (formData) =>
    fetch(`${API_BASE}/incharges/verification`, {
      method: 'POST',
      headers: { Authorization: headers().Authorization },
      body: formData
    }).then((r) => r.json()),
  // Admin only
  list: (params) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/incharges${q ? '?' + q : ''}`, { headers: headers() }).then((r) => r.json());
  },
  getById: (id) =>
    fetch(`${API_BASE}/incharges/${id}`, { headers: headers() }).then((r) => r.json()),
  verify: (id) =>
    fetch(`${API_BASE}/incharges/${id}/verify`, {
      method: 'PUT',
      headers: headers()
    }).then((r) => r.json())
};
