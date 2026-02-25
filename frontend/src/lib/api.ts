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

export const api = {
    async checkHealth() {
        const res = await fetch(`${API_BASE_URL}/health`);
        if (!res.ok) throw new Error('API Error');
        return res.json();
    },

    async getMeteo(lat: number, lng: number) {
        const res = await fetch(`${API_BASE_URL}/meteo?latitude=${lat}&longitude=${lng}`);
        if (!res.ok) throw new Error('Failed to fetch meteo');
        return res.json();
    },

    async predictCrop(params: SoilParams) {
        const res = await fetch(`${API_BASE_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });
        if (!res.ok) throw new Error('Failed to predict crop');
        return res.json();
    },

    async fullAnalysis(params: IrrigationParams) {
        const res = await fetch(`${API_BASE_URL}/analise-completa`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });
        if (!res.ok) throw new Error('Failed to get full analysis');
        return res.json();
    }
};
