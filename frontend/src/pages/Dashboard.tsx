import { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { WeatherWidget } from '../components/dashboard/WeatherWidget';
import { SystemMetricsSidebar } from '../components/dashboard/SystemMetricsSidebar';
import { FarmMap } from '../components/dashboard/FarmMap';
import { SectorsGrid } from '../components/dashboard/SectorsGrid';
import { WeatherPage } from './WeatherPage';
import ChatBot from '../components/dashboard/ChatBot';
import type { Zone } from '../types';
import { api, authInfo } from '../lib/api';

interface DashboardProps {
    onNavigate: (view: 'landing' | 'login' | 'register' | 'dashboard') => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<'visao-geral' | 'mapa-interativo' | 'setores' | 'previsao'>('visao-geral');
    const [isEditMode, setIsEditMode] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);

    // Polygon representing the main plantation area
    const [farmPolygon, setFarmPolygon] = useState<[number, number][]>([]);

    const [zones, setZones] = useState<Zone[]>([]);

    // localStorage helpers — chaves únicas por fazenda para isolar dados multi-tenant
    const polygonKey = (fazendaId: number | string) => `hydrolean_polygon_${fazendaId}`;
    const zonesKey = (fazendaId: number | string) => `hydrolean_zones_${fazendaId}`;

    const savePolygonLocal = (fazendaId: number | string, coords: [number, number][]) => {
        localStorage.setItem(polygonKey(fazendaId), JSON.stringify(coords));
    };

    const loadPolygonLocal = (fazendaId: number | string): [number, number][] | null => {
        const raw = localStorage.getItem(polygonKey(fazendaId));
        if (!raw) return null;
        try { return JSON.parse(raw); } catch { return null; }
    };

    const saveZonesLocal = (fazendaId: number | string, z: Zone[]) => {
        localStorage.setItem(zonesKey(fazendaId), JSON.stringify(z));
    };

    const loadZonesLocal = (fazendaId: number | string): Zone[] | null => {
        const raw = localStorage.getItem(zonesKey(fazendaId));
        if (!raw) return null;
        try { return JSON.parse(raw); } catch { return null; }
    };

    // Lê o fazenda_id diretamente do JWT para carregar localStorage antes do /me terminar
    const getFazendaIdFromToken = (): number | null => {
        try {
            const token = authInfo.getToken();
            if (!token) return null;
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.fazenda_id ?? null;
        } catch { return null; }
    };

    useEffect(() => {
        // 1 - IMEDIATO: Carrega do localStorage com chave específica do utilizador
        const fazendaIdFromToken = getFazendaIdFromToken();
        if (fazendaIdFromToken) {
            const localPolygon = loadPolygonLocal(fazendaIdFromToken);
            if (localPolygon && localPolygon.length > 0) setFarmPolygon(localPolygon);
            const localZones = loadZonesLocal(fazendaIdFromToken);
            if (localZones) setZones(localZones);
        }

        // 2 - ASYNC: Sync with backend (source of truth)
        const loadDashboardData = async () => {
            try {
                const profile = await api.getMe();
                setUserProfile(profile);
                if (profile.polygon_coordinates) {
                    try {
                        const backendPolygon = JSON.parse(profile.polygon_coordinates);
                        if (backendPolygon && backendPolygon.length > 0) {
                            setFarmPolygon(backendPolygon);
                            savePolygonLocal(profile.fazenda_id, backendPolygon);
                        }
                    } catch (e) { /* mantém dados locais */ }
                }

                const fetchedZones = await api.getZones();
                if (fetchedZones && fetchedZones.length > 0) {
                    setZones(fetchedZones);
                    saveZonesLocal(profile.fazenda_id, fetchedZones);
                }
            } catch (err: any) {
                console.error("Dashboard failed to fetch data:", err);
                if (err.message === 'Não autorizado') {
                    authInfo.removeToken();
                    onNavigate('login');
                }
                // If backend fails, local data is still being used (already set above)
            }
        };

        loadDashboardData();
    }, [onNavigate]);

    // Dynamic Map Center
    const mapCenter = useMemo<[number, number]>(() => {
        if (farmPolygon.length > 0) {
            return farmPolygon[0];
        }
        if (zones.length > 0) {
            return [zones[0].lat, zones[0].lng];
        }
        return [-12.7930, 15.7400]; // Default Huambo fallback
    }, [farmPolygon, zones]);

    const onMapCreated = async (e: any) => {
        const { layerType, layer } = e;
        if (layerType === 'polygon') {
            const latlngs = layer.getLatLngs()[0];
            const newCoords = latlngs.map((ll: any) => [ll.lat, ll.lng]);
            setFarmPolygon(newCoords);
            setTimeout(() => {
                if (layer && layer.remove) layer.remove();
            }, 10);

            try {
                const fid = getFazendaIdFromToken();
                if (fid) savePolygonLocal(fid, newCoords); // Salva localmente primeiro
                await api.updateFarmPolygon(newCoords);
            } catch (err) { console.error("Failed to save polygon", err); }

        } else if (layerType === 'marker') {
            const latlng = layer.getLatLng();
            const newZonePayload = {
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

            try {
                const createdZone = await api.createZone(newZonePayload);
                setZones((prev) => {
                    const updated = [...prev, createdZone];
                    const fid = getFazendaIdFromToken();
                    if (fid) saveZonesLocal(fid, updated); // Salva localmente
                    return updated;
                });
            } catch (err) {
                console.error("Failed to create zone in DB", err);
            }

            setTimeout(() => {
                if (layer && layer.remove) layer.remove();
            }, 10);
        }
    };

    const onMapEdited = async (e: any) => {
        const { layers } = e;
        let newCoords: [number, number][] = [];
        layers.eachLayer((layer: any) => {
            if (layer.getLatLngs) {
                const latlngs = layer.getLatLngs()[0];
                newCoords = latlngs.map((ll: any) => [ll.lat, ll.lng]);
                setFarmPolygon(newCoords);
            }
        });
        if (newCoords.length > 0) {
            const fid = getFazendaIdFromToken();
            if (fid) savePolygonLocal(fid, newCoords); // Salva localmente
            try { await api.updateFarmPolygon(newCoords); } catch (err) { console.error("Edited polygon save failed", err); }
        }
    };

    const onMapDeleted = async (e: any) => {
        const { layers } = e;
        let deletedPolygon = false;
        layers.eachLayer((layer: any) => {
            if (layer.getLatLngs) {
                deletedPolygon = true;
            }
        });
        if (deletedPolygon) {
            setFarmPolygon([]);
            const fid = getFazendaIdFromToken();
            if (fid) savePolygonLocal(fid, []); // Limpa localmente
            try { await api.updateFarmPolygon([]); } catch (err) { console.error("Deleted polygon save failed", err); }
        }
    };

    const handleDeleteZone = async (id: number) => {
        try {
            await api.deleteZone(id);
            setZones((prev) => {
                const updated = prev.filter(z => z.id !== id);
                const fid = getFazendaIdFromToken();
                if (fid) saveZonesLocal(fid, updated); // Atualiza cache local
                return updated;
            });
        } catch (err) {
            console.error("Failed to delete zone", err);
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

    const handleEquipmentPlaced = async (type: string, lat: number, lng: number) => {
        const names: Record<string, string> = {
            sensor: 'Sensor', tank: 'Reservatório', pump: 'Bomba', solar: 'Painel Solar', warehouse: 'Armém'
        };
        const payload = {
            name: `${names[type] ?? type} ${Math.floor(Math.random() * 100)}`,
            type,
            status: 'optimal',
            lat,
            lng,
            crop: 'Não definido',
            moisture: type === 'sensor' ? 50 : 0,
            temp: type === 'sensor' ? 25 : 0,
            rainForecast: 'Sem dados',
            battery: 100,
            signal: 'ND',
            lastUpdate: 'Agora',
            aiMode: false,
            pumpOn: false,
            level: type === 'tank' ? Math.floor(Math.random() * 101) : undefined
        };
        try {
            const created = await api.createZone(payload);
            setZones((prev) => {
                const updated = [...prev, created];
                const fid = getFazendaIdFromToken();
                if (fid) saveZonesLocal(fid, updated);
                return updated;
            });
        } catch (err) {
            console.error('Failed to place equipment', err);
        }
    };

    const handleSaveLocation = async () => {
        setIsEditMode(false);
        const fid = getFazendaIdFromToken();
        // Salva no localStorage primeiro (garante persistência imediata)
        if (fid && farmPolygon.length > 0) {
            savePolygonLocal(fid, farmPolygon);
        }
        // Sincroniza com o backend
        try {
            if (farmPolygon.length > 0) {
                await api.updateFarmPolygon(farmPolygon);
            }
        } catch (err) {
            console.error("Backend save failed, localStorage está atualizado", err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans selection:bg-brand-accent selection:text-white overflow-hidden">

            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onNavigate={onNavigate} userProfile={userProfile} />

            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <Topbar onNavigate={onNavigate} />

                {/* Dashboard Main Content Area */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8 scroll-smooth">
                    <div className="max-w-[1400px] mx-auto flex flex-col xl:flex-row gap-6 lg:gap-8 items-start">

                        {(activeTab === 'visao-geral' || activeTab === 'mapa-interativo') ? (
                            <>
                                {/* Map & Main Stats (Left/Center) */}
                                <div className={`flex flex-col gap-6 w-full ${activeTab === 'mapa-interativo' ? 'flex-1 h-[calc(100vh-160px)] lg:h-[calc(100vh-140px)] min-h-0' : 'flex-1 min-w-0 max-w-full xl:max-w-[calc(100%-412px)]'}`}>
                                    {activeTab === 'visao-geral' && <WeatherWidget />}

                                    <FarmMap
                                        activeTab={activeTab}
                                        mapCenter={mapCenter}
                                        isEditMode={isEditMode}
                                        setIsEditMode={setIsEditMode}
                                        farmPolygon={farmPolygon}
                                        zones={zones}
                                        onMapCreated={onMapCreated}
                                        onMapEdited={onMapEdited}
                                        onMapDeleted={onMapDeleted}
                                        onSaveLocation={handleSaveLocation}
                                        onEquipmentPlaced={handleEquipmentPlaced}
                                        handleMarkerDragEnd={handleMarkerDragEnd}
                                        handleDeleteZone={handleDeleteZone}
                                    />
                                </div>

                                {/* Summary Widgets (Right) */}
                                {activeTab === 'visao-geral' && (
                                    <SystemMetricsSidebar />
                                )}
                            </>
                        ) : activeTab === 'previsao' ? (
                            <WeatherPage lat={mapCenter[0]} lng={mapCenter[1]} />
                        ) : (
                            <SectorsGrid
                                zones={zones}
                                handleToggleAi={handleToggleAi}
                                handleTogglePump={handleTogglePump}
                            />
                        )}

                    </div>
                    {/* Bottom padding for scrollability */}
                    <div className="h-12 w-full"></div>
                </div>
            </main>

            {/* ====== CHATBOT FLUTUANTE ====== */}
            <ChatBot />
        </div>
    );
}
