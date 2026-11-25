import { useEffect, useRef } from 'react'
import L from 'leaflet'
import type { SchemeSummary } from '../types'

interface CommandMapProps {
  scheme: SchemeSummary
}

export function CommandMap({ scheme }: CommandMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const instanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    if (instanceRef.current) {
      instanceRef.current.remove()
      instanceRef.current = null
    }

    const map = L.map(mapRef.current, {
      center: [scheme.latitude - 0.008, scheme.longitude],
      zoom: 13,
      scrollWheelZoom: false,
    })
    instanceRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    // Draw main canal backbone from head to tail
    const centroids: [number, number][] = []

    scheme.zones.forEach((zone) => {
      const stressRatio = zone.current_depletion_mm / Math.max(1, zone.raw_mm)
      const color =
        stressRatio > 0.75 ? '#dc2626' : stressRatio > 0.45 ? '#d97706' : '#059669'

      const polygon = L.polygon(zone.geojson_coords, {
        color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.32,
      }).addTo(map)

      const bounds = polygon.getBounds()
      const center = bounds.getCenter()
      centroids.push([center.lat, center.lng])

      polygon.bindPopup(
        `<div style="min-width:200px;font-size:12px;">
          <div style="font-weight:700;color:#0f172a;margin-bottom:4px;">${zone.name}</div>
          <div><b>Reach:</b> ${zone.reach.toUpperCase()} (${zone.area_ha} ha)</div>
          <div><b>Crop:</b> ${zone.crop} (${zone.crop_stage})</div>
          <div><b>Soil:</b> ${zone.soil_type}</div>
          <div><b>Depletion:</b> ${zone.current_depletion_mm} / ${zone.raw_mm} mm RAW</div>
          <div><b>Sentinel-2 NDVI:</b> ${zone.ndvi.toFixed(2)}</div>
        </div>`
      )

      L.tooltip({ permanent: true, direction: 'center', className: 'text-xs font-semibold' })
        .setLatLng(center)
        .setContent(`${zone.reach.toUpperCase()}: ${zone.crop}`)
        .addTo(map)
    })

    if (centroids.length >= 2) {
      L.polyline(centroids, {
        color: '#0284c7',
        weight: 4,
        dashArray: '8, 6',
      })
        .bindTooltip('Main Distributary Canal')
        .addTo(map)
    }

    return () => {
      map.remove()
      instanceRef.current = null
    }
  }, [scheme])

  return (
    <div className="relative h-80 w-full overflow-hidden rounded-xl border border-slate-200">
      <div ref={mapRef} className="h-full w-full" />
      <div className="absolute bottom-2 left-2 z-[400] flex items-center gap-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs shadow-sm border border-slate-200">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Optimal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-600" /> Moderate Stress
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-600" /> Tail Deficit Risk
        </span>
      </div>
    </div>
  )
}
