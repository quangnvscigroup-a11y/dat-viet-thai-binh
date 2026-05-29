'use client'
import { useEffect, useRef } from 'react'

export default function Map({ lots }: { lots: any[] }) {
  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (mapInstanceRef.current) return
    if (!mapRef.current) return

    import('leaflet').then((L) => {
      if (mapInstanceRef.current) return
      if (mapRef.current._leaflet_id) return

      const map = L.map(mapRef.current, { preferCanvas: true, maxZoom: 18 }).setView([20.537, 106.337], 15)
      mapInstanceRef.current = map

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri', maxZoom: 18, maxNativeZoom: 18
      }).addTo(map)

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 20, opacity: 0.8
      }).addTo(map)

      lots.forEach((lot) => {
        if (!lot.coords || lot.coords.length < 3) return
        const color = lot.status === 'da_ban' ? '#f85149' :
          lot.type === 'tho_cu' ? '#16a34a' :
          lot.type === 'du_an' ? '#2563eb' : '#d97706'

        const poly = L.polygon(lot.coords, {
          color, weight: 2.5, fillColor: color, fillOpacity: 0.35
        }).addTo(map)

        poly.bindPopup(`
          <div style="font-family:sans-serif;min-width:200px">
            <b style="font-size:14px">${lot.name}</b><br/>
            <span style="font-size:20px;font-weight:800;color:#16a34a">${Number(lot.price).toLocaleString('vi-VN')} triệu</span><br/>
            <small>${lot.dien_tich} m²</small><br/>
            <a href="/lot/${lot.id}" style="color:#2563eb;font-size:13px">→ Xem chi tiết</a>
          </div>
        `)
      })
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }}/>
    </>
  )
}