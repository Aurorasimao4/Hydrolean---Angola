import L from 'leaflet';

export type EquipmentType = 'sensor' | 'tank' | 'pump' | 'solar' | 'warehouse';

const SVGS: Record<EquipmentType, string> = {
    sensor: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white relative z-10"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
    tank: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white relative z-10"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`,
    pump: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white relative z-10"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>`,
    solar: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white relative z-10"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    warehouse: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white relative z-10"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
};

const COLORS: Record<EquipmentType, string> = {
    sensor: 'bg-emerald-500',
    tank: 'bg-blue-600',
    pump: 'bg-cyan-600',
    solar: 'bg-amber-500',
    warehouse: 'bg-gray-600',
};

export const createCustomIcon = (
    type: string,
    status?: string
) => {
    const eqType = (type as EquipmentType) in COLORS ? (type as EquipmentType) : 'sensor';
    const bgColor = status === 'irrigating' && eqType === 'sensor'
        ? 'bg-blue-500'
        : status === 'attention' && eqType === 'sensor'
            ? 'bg-orange-500'
            : COLORS[eqType];

    const pulseEffect = status === 'irrigating'
        ? `<span class="absolute inset-0 ${bgColor} rounded-full animate-ping opacity-75"></span>`
        : '';

    const iconSvg = SVGS[eqType] ?? SVGS.sensor;

    return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
            <div class="relative group/pin cursor-pointer">
                <div class="w-10 h-10 rounded-full border-[3px] border-white shadow-xl flex items-center justify-center relative transition-transform duration-300 hover:scale-[1.15] ${bgColor}">
                    ${iconSvg}
                    ${pulseEffect}
                    <div class="absolute -inset-2 ${bgColor} opacity-20 blur-md rounded-full -z-10 group-hover/pin:opacity-40 transition-opacity"></div>
                </div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
    });
};
