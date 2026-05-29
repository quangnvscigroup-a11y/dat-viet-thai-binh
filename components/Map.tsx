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

    // @ts-ignore
    import('@goongmaps/goong-js').then((goongjs) => {
      if (mapInstanceRef.current) return

      const G = goongjs.default || goongjs
      G.accessToken = apiKey

      const map = new G.Map({
        container: mapRef.current,
        style: 'https://tiles.goong.io/assets/goong_map_web.json?api_key=' + apiKey,