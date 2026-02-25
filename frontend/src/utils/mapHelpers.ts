import L from 'leaflet';

export const createCustomIcon = (type: 'tank' | 'sensor', status: 'optimal' | 'irrigating' | 'tank' | 'attention') => {
    const bgColor = type === 'tank'
        ? 'bg-blue-600'
        : status === 'irrigating'
            ? 'bg-brand-primary'
            : status === 'attention'
                ? 'bg-orange-500'
                : 'bg-green-500';

    const pulseEffect = status === 'irrigating'
        ? '<span class="absolute inset-0 bg-brand-primary rounded-full animate-ping opacity-75"></span>'
        : '';

    const iconSvg = type === 'tank'
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white relative z-10"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white relative z-10"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>';

    return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
            <div class="relative group/pin cursor-pointer">
                <div class="w-10 h-10 rounded-full border-[3px] border-white shadow-xl flex items-center justify-center relative transition-transform duration-300 hover:scale-[1.15] ${bgColor}">
                    ${iconSvg}
                    ${pulseEffect}
                    <!-- Subtle drop shadow glow based on status -->
                    <div class="absolute -inset-2 ${bgColor} opacity-20 blur-md rounded-full -z-10 group-hover/pin:opacity-40 transition-opacity"></div>
                </div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
    });
};
