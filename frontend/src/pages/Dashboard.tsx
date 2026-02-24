import { useState, useEffect } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { WeatherWidget } from '../components/dashboard/WeatherWidget';
import { SystemMetricsSidebar } from '../components/dashboard/SystemMetricsSidebar';
import { FarmMap } from '../components/dashboard/FarmMap';
import { SectorsGrid } from '../components/dashboard/SectorsGrid';
import type { Zone, ZoneStatus } from '../types';
import { FileText } from 'lucide-react';

interface DashboardProps {
    onNavigate: (view: 'landing' | 'login' | 'register' | 'dashboard') => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<'visao-geral' | 'mapa-interativo' | 'setores' | 'relatorios'>('visao-geral');
    const [isEditMode, setIsEditMode] = useState(false);

    // Force map resize when tab changes so Leaflet fetches new tiles
    useEffect(() => {
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    }, [activeTab]);

    // Polygon representing the main plantation area
    const [farmPolygon, setFarmPolygon] = useState<[number, number][]>([
        [-12.7880, 15.7360],
        [-12.7890, 15.7470],
        [-12.7960, 15.7450],
        [-12.7950, 15.7350],
    ]);

    const [zones, setZones] = useState<Zone[]>([
        {
            id: 1,
            name: 'Setor Norte',
            crop: 'Milho',
            status: 'optimal' as ZoneStatus,
            moisture: 65,
            temp: 28,
            rainForecast: 'Sem chuva prevista',
            battery: 92,
            signal: 'Rede 4G LTE',
            lastUpdate: 'Agora',
            lat: -12.7915,
            lng: 15.7380,
            type: 'sensor' as const,
            aiMode: true,
            pumpOn: false
        },
        {
            id: 2,
            name: 'Setor Sul',
            crop: 'Tomate',
            status: 'irrigating' as ZoneStatus,
            moisture: 30,
            temp: 29,
            rainForecast: 'Chuva em 4h',
            battery: 85,
            signal: 'Rede 4G LTE',
            lastUpdate: 'Agora',
            lat: -12.7940,
            lng: 15.7420,
            type: 'sensor' as const,
            aiMode: true,
            pumpOn: true
        },
        {
            id: 3,
            name: 'Tanque Principal',
            type: 'tank' as const,
            level: 78,
            lat: -12.7935,
            lng: 15.7445,
            status: 'tank' as ZoneStatus
        }
    ]);

    // Map Data Simulation Center
    const mapCenter: [number, number] = [-12.7930, 15.7400];

    const onMapCreated = (e: any) => {
        const { layerType, layer } = e;
        if (layerType === 'polygon') {
            const latlngs = layer.getLatLngs()[0];
            const newCoords = latlngs.map((ll: any) => [ll.lat, ll.lng]);
            setFarmPolygon(newCoords);
            if (layer && layer.remove) layer.remove();
        } else if (layerType === 'marker') {
            const latlng = layer.getLatLng();
            const newZone: Zone = {
                id: Date.now(),
                name: 'Novo Sensor ' + Math.floor(Math.random() * 1000),
                type: 'sensor',
                status: 'optimal',
                lat: latlng.lat,
                lng: latlng.lng,
                crop: 'Não definido',
                moisture: 50,
                temp: 25,
                rainForecast: 'Sem dados',
                battery: 100,
                signal: 'ND',
                lastUpdate: 'Agora',
                aiMode: false,
                pumpOn: false
            };
            setZones([...zones, newZone]);
            if (layer && layer.remove) layer.remove();
        }
    };

    const handleToggleAi = (id: number) => {
        setZones(zones.map(z => z.id === id ? { ...z, aiMode: !z.aiMode } as Zone : z));
    };

    const handleMarkerDragEnd = (id: number, event: any) => {
        const marker = event.target;
        const position = marker.getLatLng();
        setZones(zones.map(z => z.id === id ? { ...z, lat: position.lat, lng: position.lng } as Zone : z));
    };

    const handleTogglePump = (id: number) => {
        setZones(zones.map(z => {
            if (z.id === id) {
                const newPumpOn = !z.pumpOn;
                return {
                    ...z,
                    pumpOn: newPumpOn,
                    status: newPumpOn ? 'irrigating' : (z.moisture && z.moisture < 40 ? 'attention' : 'optimal')
                } as Zone;
            }
            return z;
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans selection:bg-brand-accent selection:text-white overflow-hidden">

            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onNavigate={onNavigate} />

            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <Topbar />

                {/* Dashboard Main Content Area */}
                <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
                    <div className="max-w-[1400px] mx-auto flex flex-col xl:flex-row gap-8 items-start">

                        {(activeTab === 'visao-geral' || activeTab === 'mapa-interativo') ? (
                            <>
                                {/* Map & Main Stats (Left/Center) */}
                                <div className={`flex flex-col gap-6 w-full ${activeTab === 'mapa-interativo' ? 'flex-1 h-[calc(100vh-140px)] min-h-0' : 'flex-1 min-w-0 max-w-full xl:max-w-[calc(100%-412px)]'}`}>
                                    {activeTab === 'visao-geral' && <WeatherWidget />}

                                    <FarmMap
                                        activeTab={activeTab}
                                        mapCenter={mapCenter}
                                        isEditMode={isEditMode}
                                        setIsEditMode={setIsEditMode}
                                        farmPolygon={farmPolygon}
                                        zones={zones}
                                        onMapCreated={onMapCreated}
                                        handleMarkerDragEnd={handleMarkerDragEnd}
                                    />
                                </div>

                                {/* Summary Widgets (Right) */}
                                {activeTab === 'visao-geral' && (
                                    <SystemMetricsSidebar />
                                )}
                            </>
                        ) : activeTab === 'setores' ? (
                            <SectorsGrid
                                zones={zones}
                                handleToggleAi={handleToggleAi}
                                handleTogglePump={handleTogglePump}
                            />
                        ) : (
                            <div className="flex-1 flex flex-col gap-6 items-center justify-center min-h-[500px] text-gray-500">
                                <FileText size={48} className="text-gray-300 mb-2" />
                                <p className="text-lg font-bold">Módulo de Relatórios em Breve</p>
                                <p className="text-sm">Geração de PDFs, Excel e análises detalhadas.</p>
                            </div>
                        )}

                    </div>
                    {/* Bottom padding for scrollability */}
                    <div className="h-12 w-full"></div>
                </div>
            </main>
        </div>
    );
}
