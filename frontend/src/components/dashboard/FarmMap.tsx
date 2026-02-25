import { MapContainer, TileLayer, Marker, Popup, Polygon, FeatureGroup, useMap, useMapEvents } from 'react-leaflet';
import { useEffect, useState } from 'react';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import { Settings, Map as MapIcon, Droplets, CloudSun, CloudRain, Trash2, Activity, Waves, Zap, Sun, Home } from 'lucide-react';
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
    onMapEdited: (e: any) => void;
    onMapDeleted: (e: any) => void;
    onSaveLocation: () => void;
    onEquipmentPlaced: (type: string, lat: number, lng: number) => void;
    handleMarkerDragEnd: (id: number, event: any) => void;
    handleDeleteZone: (id: number) => void;
}

const EQUIPMENT_TYPES = [
    { id: 'sensor', label: 'Sensor', sub: 'Solo / Humidade', Icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'tank', label: 'Reservatório', sub: 'Armazenamento água', Icon: Waves, color: 'text-blue-600   bg-blue-50' },
    { id: 'pump', label: 'Bomba', sub: 'Bomba de irrigação', Icon: Zap, color: 'text-cyan-600   bg-cyan-50' },
    { id: 'solar', label: 'Painel Solar', sub: 'Fonte de energia', Icon: Sun, color: 'text-amber-600  bg-amber-50' },
    { id: 'warehouse', label: 'Armazém', sub: 'Armazenamento geral', Icon: Home, color: 'text-gray-600   bg-gray-50' },
];

// Helper component to fix tile loading when parent element resizes
function MapResizer() {
    const map = useMap();
    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => { map.invalidateSize(); });
        resizeObserver.observe(map.getContainer());
        return () => resizeObserver.disconnect();
    }, [map]);
    return null;
}

// ClickHandler: intercepts map clicks to place equipment when a type is selected
function EquipmentClickHandler({
    selectedType,
    onPlace,
}: {
    selectedType: string | null;
    onPlace: (lat: number, lng: number) => void;
}) {
    useMapEvents({
        click(e) {
            if (selectedType) {
                onPlace(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return null;
}

// Panel rendered inside the Leaflet container using a portal-like pattern
function EquipmentPanel({
    selectedEquipment,
    setSelectedEquipment,
}: {
    selectedEquipment: string | null;
    setSelectedEquipment: (v: string | null) => void;
}) {
    const map = useMap();

    useEffect(() => {
        // Prevent map clicks/scroll propagation when mouse is over the panel
        const container = map.getContainer();
        const panel = container.querySelector('#equipment-panel');
        if (panel) {
            L.DomEvent.disableClickPropagation(panel as HTMLElement);
            L.DomEvent.disableScrollPropagation(panel as HTMLElement);
        }
    }, [map]);

    return (
        <div
            id="equipment-panel"
            className="absolute left-3 top-[68px] z-[1002] w-52 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 p-3"
            style={{ pointerEvents: 'all' }}
        >
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2.5">Adicionar Equipamento</p>
            <div className="space-y-1">
                {EQUIPMENT_TYPES.map(({ id, label, sub, Icon, color }) => {
                    const isSelected = selectedEquipment === id;
                    return (
                        <button
                            key={id}
                            onClick={(ev) => { ev.stopPropagation(); setSelectedEquipment(isSelected ? null : id); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 border ${isSelected
                                ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-sm'
                                : 'border-transparent hover:bg-gray-50 text-gray-700 hover:border-gray-200'
                                }`}
                        >
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-brand-primary/20' : color}`}>
                                <Icon size={15} className={isSelected ? 'text-brand-primary' : ''} />
                            </span>
                            <div className="min-w-0">
                                <p className="text-xs font-bold leading-tight">{label}</p>
                                <p className="text-[10px] text-gray-400 leading-tight truncate">{sub}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
            <div className={`mt-3 pt-2.5 border-t border-gray-100 text-center transition-all ${selectedEquipment ? 'text-brand-primary' : 'text-gray-400'}`}>
                <p className="text-[10px] font-semibold">
                    {selectedEquipment ? `✦ Clique no mapa para colocar` : 'Selecione e clique no mapa'}
                </p>
            </div>
        </div>
    );
}

export function FarmMap({
    activeTab,
    mapCenter,
    isEditMode,
    setIsEditMode,
    farmPolygon,
    zones,
    onMapCreated,
    onMapEdited,
    onMapDeleted,
    onSaveLocation,
    onEquipmentPlaced,
    handleMarkerDragEnd,
    handleDeleteZone,
}: FarmMapProps) {
    const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);

    const handlePlace = (lat: number, lng: number) => {
        if (!selectedEquipment) return;
        onEquipmentPlaced(selectedEquipment, lat, lng);
        // Do NOT clear selection so user can keep placing
    };

    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative group z-0 ${activeTab === 'mapa-interativo' ? 'flex-1 min-h-0' : 'h-[400px] xl:h-[450px] 2xl:h-[550px] shrink-0'}`}>
            {/* Map Header overlay */}
            <div className="p-4 flex justify-between items-center absolute w-full top-0 z-[1000] bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                <h3 className="font-bold text-white flex items-center gap-2 drop-shadow-md"><MapIcon size={18} className="text-brand-accent" /> Plantio Principal (Huambo)</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => { setIsEditMode(!isEditMode); setSelectedEquipment(null); }}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm border z-[1001] pointer-events-auto transition-colors ${isEditMode ? 'bg-brand-accent text-white border-brand-accent' : 'bg-white/90 text-brand-black border-gray-200 backdrop-blur-md hover:bg-white'}`}
                    >
                        <Settings size={14} /> {isEditMode ? 'Cancelar Edição' : 'Editar Fazenda'}
                    </button>
                    {isEditMode && (
                        <button onClick={onSaveLocation} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm border z-[1001] pointer-events-auto transition-colors bg-green-500 text-white border-green-500 hover:bg-green-600">
                            Salvar Localização
                        </button>
                    )}
                    <span className="flex items-center gap-1.5 text-xs font-bold text-brand-black bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Ideal</span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-brand-black bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm"><span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-ping"></span> Irrigando</span>
                </div>
            </div>

            {/* Equipment Sidebar Panel (only in edit mode) */}
            {isEditMode && (
                <div className="absolute left-3 top-[68px] z-[1002] w-52 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 p-3 pointer-events-auto">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2.5">Adicionar Equipamento</p>
                    <div className="space-y-1">
                        {EQUIPMENT_TYPES.map(({ id, label, sub, Icon, color }) => {
                            const isSelected = selectedEquipment === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => setSelectedEquipment(isSelected ? null : id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 border ${isSelected
                                        ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-sm'
                                        : 'border-transparent hover:bg-gray-50 text-gray-700 hover:border-gray-200'
                                        }`}
                                >
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-brand-primary/20' : color}`}>
                                        <Icon size={15} className={isSelected ? 'text-brand-primary' : ''} />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold leading-tight">{label}</p>
                                        <p className="text-[10px] text-gray-400 leading-tight truncate">{sub}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <div className={`mt-3 pt-2.5 border-t border-gray-100 text-center transition-all ${selectedEquipment ? 'text-brand-primary' : 'text-gray-400'}`}>
                        <p className="text-[10px] font-semibold">
                            {selectedEquipment
                                ? `✦ Clique no mapa para colocar`
                                : 'Selecione e clique no mapa'}
                        </p>
                    </div>
                </div>
            )}

            {/* React Leaflet MapContainer */}
            <div className={`w-full relative z-0 flex-1 rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 ${isEditMode && selectedEquipment ? 'cursor-crosshair' : ''}`}>
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
                    <EquipmentClickHandler
                        selectedType={isEditMode ? selectedEquipment : null}
                        onPlace={handlePlace}
                    />
                    {isEditMode && (
                        <EquipmentPanel
                            selectedEquipment={selectedEquipment}
                            setSelectedEquipment={setSelectedEquipment}
                        />
                    )}

                    {/* Farm boundary polygon + draw controls */}
                    <FeatureGroup>
                        {isEditMode && !selectedEquipment && (
                            <EditControl
                                position='topright'
                                onCreated={onMapCreated}
                                onEdited={onMapEdited}
                                onDeleted={onMapDeleted}
                                draw={{
                                    rectangle: false,
                                    polyline: false,
                                    circle: false,
                                    circlemarker: false,
                                    marker: false,
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

                    {/* Render all equipment markers */}
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
                                        <div className="flex items-center gap-2">
                                            {zone.name}
                                            {zone.status === 'irrigating' && <span className="bg-brand-primary text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">Irrigando</span>}
                                            {zone.status === 'optimal' && <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full">Ideal</span>}
                                        </div>
                                        {isEditMode && (
                                            <button onClick={() => handleDeleteZone(zone.id)} className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
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
                                    ) : zone.type === 'tank' ? (
                                        <div className="text-center py-3">
                                            <div className="w-16 h-16 rounded-full border-4 border-gray-100 flex items-center justify-center mx-auto mb-2 relative overflow-hidden">
                                                <div className="absolute bottom-0 w-full bg-blue-500 rounded-b-full transition-all duration-1000" style={{ height: `${zone.level ?? 70}%` }}></div>
                                                <span className="relative z-10 font-black text-gray-900 drop-shadow-sm">{zone.level ?? 70}%</span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium">Reservatório</p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-3 text-gray-500 text-xs">
                                            <p className="font-bold capitalize">{EQUIPMENT_TYPES.find(e => e.id === zone.type)?.label ?? zone.type}</p>
                                            <p className="text-[10px] mt-1">{EQUIPMENT_TYPES.find(e => e.id === zone.type)?.sub}</p>
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
