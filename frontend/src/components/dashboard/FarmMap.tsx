
import { MapContainer, TileLayer, Marker, Popup, Polygon, FeatureGroup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { EditControl } from 'react-leaflet-draw';
import { Settings, Map as MapIcon, Droplets, CloudSun, CloudRain } from 'lucide-react';
import type { Zone } from '../../types';
import { createCustomIcon } from '../../utils/mapHelpers';

interface FarmMapProps {
    activeTab: 'visao-geral' | 'mapa-interativo' | 'setores' | 'relatorios';
    mapCenter: [number, number];
    isEditMode: boolean;
    setIsEditMode: (mode: boolean) => void;
    farmPolygon: [number, number][];
    zones: Zone[];
    onMapCreated: (e: any) => void;
    handleMarkerDragEnd: (id: number, event: any) => void;
}

// Helper component to fix tile loading when parent element resizes
function MapResizer() {
    const map = useMap();
    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            map.invalidateSize();
        });
        const container = map.getContainer();
        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, [map]);
    return null;
}

export function FarmMap({
    activeTab,
    mapCenter,
    isEditMode,
    setIsEditMode,
    farmPolygon,
    zones,
    onMapCreated,
    handleMarkerDragEnd
}: FarmMapProps) {
    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative group z-0 ${activeTab === 'mapa-interativo' ? 'flex-1 min-h-0' : 'h-[400px] xl:h-[450px] 2xl:h-[550px] shrink-0'}`}>
            {/* Map Header overlay */}
            <div className="p-4 flex justify-between items-center absolute w-full top-0 z-[1000] bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                <h3 className="font-bold text-white flex items-center gap-2 drop-shadow-md"><MapIcon size={18} className="text-brand-accent" /> Plantio Principal (Huambo)</h3>
                <div className="flex gap-2">
                    <button onClick={() => setIsEditMode(!isEditMode)} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm border z-[1001] pointer-events-auto transition-colors ${isEditMode ? 'bg-brand-accent text-white border-brand-accent' : 'bg-white/90 text-brand-black border-gray-200 backdrop-blur-md hover:bg-white'}`}>
                        <Settings size={14} /> {isEditMode ? 'Sair da Edição' : 'Editar Fazenda'}
                    </button>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-brand-black bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Ideal</span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-brand-black bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm"><span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-ping"></span> Irrigando</span>
                </div>
            </div>

            {/* React Leaflet MapContainer */}
            <div className="w-full relative z-0 flex-1 rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
                <MapContainer
                    center={mapCenter}
                    zoom={16}
                    scrollWheelZoom={true}
                    style={{ height: "100%", width: "100%", zIndex: 0 }}
                    className="leaflet-custom-container"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                    <MapResizer />

                    {/* Highlight the Farm Area and Draw Controls */}
                    <FeatureGroup>
                        {isEditMode && (
                            <EditControl
                                position='topright'
                                onCreated={onMapCreated}
                                draw={{
                                    rectangle: false,
                                    polyline: false,
                                    circle: false,
                                    circlemarker: false,
                                    marker: true,
                                    polygon: true,
                                }}
                            />
                        )}
                        <Polygon
                            positions={farmPolygon}
                            pathOptions={{
                                color: '#22c55e',
                                fillColor: '#22c55e',
                                fillOpacity: 0.2,
                                weight: 2,
                                dashArray: '5, 10'
                            }}
                        />
                    </FeatureGroup>

                    {/* Render Sensors and Tanks on the Map */}
                    {zones.map((zone) => (
                        <Marker
                            key={zone.id}
                            position={[zone.lat, zone.lng]}
                            icon={createCustomIcon(zone.type, zone.status)}
                            draggable={isEditMode}
                            eventHandlers={{
                                dragend: (e) => handleMarkerDragEnd(zone.id, e)
                            }}
                        >
                            <Popup className="custom-popup" closeButton={false}>
                                <div className="p-1 min-w-[220px]">
                                    <h4 className="font-bold text-gray-900 border-b pb-2 mb-3 flex items-center justify-between">
                                        {zone.name}
                                        {zone.status === 'irrigating' && <span className="bg-brand-primary text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">Irrigando</span>}
                                        {zone.status === 'optimal' && <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full">Ideal</span>}
                                    </h4>
                                    {zone.type === 'sensor' ? (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                <span className="text-gray-500 text-xs font-bold flex items-center gap-1.5"><Droplets size={14} className="text-brand-primary" /> Umidade</span>
                                                <span className={`font-black ${zone.moisture && zone.moisture < 40 ? 'text-orange-500' : 'text-gray-900'}`}>{zone.moisture}%</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                <span className="text-gray-500 text-xs font-bold flex items-center gap-1.5"><CloudSun size={14} className="text-orange-500" /> Temp.</span>
                                                <span className="font-black text-gray-900">{zone.temp}°C</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium pt-2 border-t">
                                                <span><CloudRain size={10} className="inline mr-1" />{zone.rainForecast}</span>
                                                <span>Bateria: {zone.battery}%</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-3">
                                            <div className="w-16 h-16 rounded-full border-4 border-gray-100 flex items-center justify-center mx-auto mb-2 relative">
                                                <div className="absolute bottom-0 w-full bg-blue-500 rounded-b-full transition-all duration-1000" style={{ height: `${zone.level}%` }}></div>
                                                <span className="relative z-10 font-black text-gray-900 drop-shadow-sm">{zone.level}%</span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium">Reservatório Principal</p>
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}
