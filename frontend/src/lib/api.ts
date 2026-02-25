const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface SoilParams {
    N: number;
    P: number;
    K: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
}

export interface IrrigationParams extends SoilParams {
    latitude: number;
    longitude: number;
    cultura?: string;
    area_hectares?: number;
    tipo_solo?: string;
    sistema_irrigacao?: string;
}

// Auth helpers
const TOKEN_KEY = 'hydrosync_token';
export const authInfo = {
    setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
    getToken: () => localStorage.getItem(TOKEN_KEY),
    removeToken: () => localStorage.removeItem(TOKEN_KEY),
    isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY)
};

// Wrapper para requisicoes autenticadas
async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers || {});
    const token = authInfo.getToken();

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        authInfo.removeToken();
        window.location.href = '/login'; // O ideal seria redirecionar via router, caso houvesse
        throw new Error('Não autorizado');
    }

    return response;
}

export const api = {
    async checkHealth() {
        const res = await fetch(`${API_BASE_URL}/health`);
        if (!res.ok) throw new Error('API Error');
        return res.json();
    },

    async getMeteo(lat: number, lng: number) {
        const res = await fetchWithAuth(`/meteo?latitude=${lat}&longitude=${lng}`);
        if (!res.ok) throw new Error('Failed to fetch meteo');
        return res.json();
    },

    async predictCrop(params: SoilParams) {
        const res = await fetchWithAuth(`/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });
        if (!res.ok) throw new Error('Failed to predict crop');
        return res.json();
    },

    async fullAnalysis(params: IrrigationParams) {
        const res = await fetchWithAuth(`/analise-completa`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });
        if (!res.ok) throw new Error('Failed to get full analysis');
        return res.json();
    },

    // --- MAP & ZONES ---
    async updateFarmPolygon(polygon: [number, number][]) {
        const res = await fetchWithAuth(`/fazenda/polygon`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ polygon: JSON.stringify(polygon) })
        });
        if (!res.ok) throw new Error('Falha ao atualizar área da fazenda');
        return res.json();
    },

    async getZones() {
        const res = await fetchWithAuth(`/fazenda/zones`);
        if (!res.ok) throw new Error('Falha ao obter zonas do mapa');
        return res.json();
    },

    async createZone(zoneData: any) {
        const res = await fetchWithAuth(`/fazenda/zones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(zoneData)
        });
        if (!res.ok) throw new Error('Falha ao guardar sensor');
        return res.json();
    },

    async updateZone(id: number, zoneData: any) {
        const res = await fetchWithAuth(`/fazenda/zones/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(zoneData)
        });
        if (!res.ok) throw new Error('Falha ao atualizar sensor');
        return res.json();
    },

    async deleteZone(id: number) {
        const res = await fetchWithAuth(`/fazenda/zones/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Falha ao apagar sensor');
        return res.json();
    },

    // --- AUTH ---
    async getMe() {
        const res = await fetchWithAuth(`/me`);
        if (!res.ok) throw new Error('Não foi possível carregar o perfil');
        return res.json();
    },

    async login(data: URLSearchParams) {
        const res = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            body: data, // FastAPI OAuth2 espera URLSearchParams (x-www-form-urlencoded)
        });
        if (!res.ok) throw new Error('Credenciais Inválidas');
        return res.json();
    },

    async register(formData: FormData) {
        const res = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            body: formData, // FormData para enviar texto e imagens
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Erro ao criar conta');
        }
        return res.json();
    }
};
