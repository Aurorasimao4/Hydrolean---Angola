export type ZoneStatus = 'optimal' | 'irrigating' | 'tank' | 'attention';

export interface Zone {
    id: number;
    name: string;
    type: 'sensor' | 'tank';
    status: ZoneStatus;
    lat: number;
    lng: number;

    // Sensor specific
    crop?: string;
    moisture?: number;
    temp?: number;
    rainForecast?: string;
    battery?: number;
    signal?: string;
    lastUpdate?: string;
    aiMode?: boolean;
    pumpOn?: boolean;

    // Tank specific
    level?: number;
}
