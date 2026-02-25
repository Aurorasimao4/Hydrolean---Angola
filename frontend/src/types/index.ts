export type ZoneStatus = 'optimal' | 'irrigating' | 'tank' | 'attention' | 'active' | 'inactive';

export type ZoneType = 'sensor' | 'tank' | 'pump' | 'solar' | 'storage';

export interface Zone {
    id: number;
    name: string;
    type: ZoneType;
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

    // Soil parameters
    N?: number;
    P?: number;
    K?: number;
    ph?: number;
    rainfall?: number;

    // Tank specific
    level?: number;
}
