'use client'
import { useEffect, useRef } from 'react'

export default function Map({ lots }: { lots: any[] }) {
  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (mapInstanceRef.current) return
    if (!mapRef.current) return

    const apiKey = process.env.NEXT_PUBLIC_GOONG_API_KEY

    import('@goongmaps/goong-js').then((goongjs: any) => {
      if (mapInstanceRef.current) return

      const G = goongjs.default || goongjs
      G.accessToken = apiKey

      const styleUrl = 'https://tiles.goong.io/assets/goong_map_web.json?api_key=' + apiKey

      const map = new G.Map({
        container: mapRef.current,
        style: styleUrl,
        center: [106.337, 20.537],
        zoom: 13
      })

      mapInstanceRef.current = map

      map.on('load', () => {
        lots.forEach((lot) => {
          if (!lot.coords || lot.coords.length < 3) return
          const color = lot.status === 'da_ban' ? '#f85149' :
            lot.type === 'tho_cu' ? '#16a34a' :
            lot.type === 'du_an' ? '#2563eb' : '#d97706'
          const id = 'lot-' + lot.id
          const coordinates = [lot.coords.map((c: number[]) => [c[1], c[0]])]
          map.addSource(id, { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Polygon', coordinates }, properties: { id: lot.id } } })
          map.addLayer({ id: id + '-fill', type: 'fill', source: id, paint: { 'fill-color': color, 'fill-opacity': 0.35 } })
          map.addLayer({ id: id + '-line', type: 'line', source: id, paint: { 'line-color': color, 'line-width': 2.5 } })
          map.on('click', id + '-fill', () => {
            const center = lot.coords.reduce((acc: number[], c: number[]) => [acc[0] + c[1] / lot.coords.length, acc[1] + c[0] / lot.coords.length], [0, 0])
            new G.Popup().setLngLat(center).setHTML('<div style="font-family:sans-serif;min-width:200px;padding:8px"><b>' + lot.name + '</b><br/><span style="font-size:18px;font-weight:800;color:#16a34a">' + Number(lot.price).toLocaleString('vi-VN') + ' triệu</span><br/><small>' + lot.dien_tich + ' m²</small><br/><a href="/lot/' + lot.id + '" style="color:#2563eb">→ Xem chi tiết</a></div>').addTo(map)
          })
          map.on('mouseenter', id + '-fill', () => { map.getCanvas().style.cursor = 'pointer' })
          map.on('mouseleave', id + '-fill', () => { map.getCanvas().style.cursor = '' })
        })
        const validLots = lots.filter(l => l.coords && l.coords.length >= 3)
        if (validLots.length > 0) {
          const allCoords = validLots.flatMap(l => l.coords.map((c: number[]) => [c[1], c[0]]))
          const lngs = allCoords.map(c => c[0])
          const lats = allCoords.map(c => c[1])
          map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: 60 })
        }
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
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css"/>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }}/>
    </>
  )
}