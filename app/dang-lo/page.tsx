'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function DangLo() {
  const router = useRouter()
  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const [drawPoints, setDrawPoints] = useState<any[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', type: 'tho_cu', status: 'dang_ban',
    price: '', dien_tich: '', ngang: '', dai: '',
    huong: '', duong: '', mo_ta: '', to_so: '', thua_so: ''
  })
  const markersRef = useRef<any[]>([])
  const polylineRef = useRef<any>(null)
  const polygonRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (mapInstanceRef.current) return

    import('leaflet').then((L) => {
      const map = L.map(mapRef.current).setView([20.537, 106.337], 16)
      mapInstanceRef.current = map

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri', maxZoom: 20, maxNativeZoom: 19
      }).addTo(map)

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 20, opacity: 0.8
      }).addTo(map)

      map.on('click', (e: any) => {
        setIsDrawing(drawing => {
          if (!drawing) return drawing
          const pt = [e.latlng.lat, e.latlng.lng]
          setDrawPoints(prev => {
            const next = [...prev, pt]
            updateMapDraw(L, map, next)
            return next
          })
          return drawing
        })
      })
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  function updateMapDraw(L: any, map: any, points: any[]) {
    markersRef.current.forEach(m => map.removeLayer(m))
    markersRef.current = []
    if (polylineRef.current) map.removeLayer(polylineRef.current)
    if (polygonRef.current) map.removeLayer(polygonRef.current)

    points.forEach((pt, i) => {
      const m = L.circleMarker(pt, {
        radius: 6, color: '#16a34a', fillColor: '#16a34a', fillOpacity: 1, weight: 2
      }).addTo(map)
      markersRef.current.push(m)
    })

    if (points.length > 1) {
      const closed = [...points, points[0]]
      polylineRef.current = L.polyline(closed, {
        color: '#16a34a', weight: 2, dashArray: '6,4'
      }).addTo(map)
    }

    if (points.length >= 3) {
      polygonRef.current = L.polygon(points, {
        color: '#16a34a', weight: 2.5, fillColor: '#16a34a', fillOpacity: 0.3
      }).addTo(map)
    }
  }

  function startDraw() {
    setIsDrawing(true)
    setDrawPoints([])
    if (mapInstanceRef.current) {
      mapInstanceRef.current.getContainer().style.cursor = 'crosshair'
    }
  }

  function finishDraw() {
    setIsDrawing(false)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.getContainer().style.cursor = ''
    }
  }

  function resetDraw() {
    setIsDrawing(false)
    setDrawPoints([])
    if (mapInstanceRef.current) {
      mapInstanceRef.current.getContainer().style.cursor = ''
      markersRef.current.forEach(m => mapInstanceRef.current.removeLayer(m))
      markersRef.current = []
      if (polylineRef.current) mapInstanceRef.current.removeLayer(polylineRef.current)
      if (polygonRef.current) mapInstanceRef.current.removeLayer(polygonRef.current)
    }
  }

  async function handleSave() {
    if (!form.name || !form.price || !form.dien_tich) {
      alert('Vui lòng nhập tên, giá và diện tích!')
      return
    }
    if (drawPoints.length < 3) {
      alert('Vui lòng vẽ ranh giới lô đất (ít nhất 3 điểm)!')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('lots').insert([{
      ...form,
      price: Number(form.price),
      dien_tich: Number(form.dien_tich),
      ngang: Number(form.ngang) || 0,
      dai: Number(form.dai) || 0,
      coords: drawPoints,
      images: []
    }])
    setSaving(false)
    if (error) { alert('Lỗi: ' + error.message); return }
    alert('✅ Đã đăng lô đất thành công!')
    router.push('/')
  }

  const inp = (id: string, placeholder: string, type = 'text') => (
    <input type={type} placeholder={placeholder} value={(form as any)[id]}
      onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
      style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'sans-serif' }}/>
  )

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Be Vietnam Pro, sans-serif', background: '#f9fafb' }}>

      {/* HEADER */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href="/" style={{ textDecoration: 'none', color: '#6b7280', fontSize: 13 }}>← Quay lại</a>
          <div style={{ width: 1, height: 20, background: '#e5e7eb', margin: '0 4px' }}/>
          <div style={{ fontSize: 17, fontWeight: 800 }}>📝 Đăng lô đất mới</div>
        </div>
        <button onClick={handleSave} disabled={saving}
          style={{ background: saving ? '#9ca3af' : '#16a34a', color: '#fff', border: 'none', padding: '9px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Đang lưu...' : '💾 Lưu lô đất'}
        </button>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* FORM */}
        <div style={{ width: 380, background: '#fff', borderRight: '1px solid #e5e7eb', overflowY: 'auto', padding: 20, flexShrink: 0 }}>

          {/* VẼ LÔ */}
          <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 10, padding: 14, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: '#166534', marginBottom: 8 }}>📍 Vẽ ranh giới lô đất</div>
            <div style={{ fontSize: 13, color: '#15803d', marginBottom: 10, lineHeight: 1.6 }}>
              {!isDrawing && drawPoints.length === 0 && 'Nhấn "Bắt đầu vẽ" rồi click từng góc lô trên bản đồ. Cần ít nhất 3 điểm.'}
              {isDrawing && `🟢 Đang vẽ... Đã chọn ${drawPoints.length} điểm${drawPoints.length < 3 ? ` (cần thêm ${3 - drawPoints.length})` : ' ✅'}`}
              {!isDrawing && drawPoints.length >= 3 && `✅ Đã vẽ xong ${drawPoints.length} điểm`}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {!isDrawing && drawPoints.length === 0 &&
                <button onClick={startDraw} style={{ flex: 1, background: '#16a34a', color: '#fff', border: 'none', padding: '9px', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  ✏️ Bắt đầu vẽ
                </button>}
              {isDrawing &&
                <button onClick={finishDraw} disabled={drawPoints.length < 3}
                  style={{ flex: 1, background: drawPoints.length >= 3 ? '#16a34a' : '#9ca3af', color: '#fff', border: 'none', padding: '9px', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: drawPoints.length >= 3 ? 'pointer' : 'not-allowed' }}>
                  ✅ Hoàn thành vẽ
                </button>}
              {drawPoints.length > 0 &&
                <button onClick={resetDraw} style={{ background: 'none', border: '1px solid #e5e7eb', color: '#6b7280', padding: '9px 14px', borderRadius: 7, fontSize: 13, cursor: 'pointer' }}>
                  🔄 Vẽ lại
                </button>}
            </div>
          </div>

          {/* THÔNG TIN */}
          <div style={{ fontWeight: 700, marginBottom: 12, color: '#111827' }}>Thông tin lô đất</div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>TÊN LÔ ĐẤT *</label>
            {inp('name', 'VD: Lô A1 – Khu dân cư Phúc Thịnh')}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>LOẠI ĐẤT *</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}>
                <option value="tho_cu">Thổ cư</option>
                <option value="du_an">Dự án</option>
                <option value="nong_nghiep">Nông nghiệp</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>TRẠNG THÁI *</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}>
                <option value="dang_ban">Đang bán</option>
                <option value="dat_coc">Đặt cọc</option>
                <option value="da_ban">Đã bán</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>GIÁ (TRIỆU) *</label>
              {inp('price', 'VD: 1850', 'number')}
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>DIỆN TÍCH (M²) *</label>
              {inp('dien_tich', 'VD: 120', 'number')}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>NGANG (M)</label>
              {inp('ngang', 'VD: 6', 'number')}
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>DÀI (M)</label>
              {inp('dai', 'VD: 20', 'number')}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>TỜ SỐ</label>
              {inp('to_so', 'VD: 12')}
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>THỬA SỐ</label>
              {inp('thua_so', 'VD: 34')}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>HƯỚNG</label>
              <select value={form.huong} onChange={e => setForm(f => ({ ...f, huong: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}>
                <option value="">-- Chọn --</option>
                {['Đông','Tây','Nam','Bắc','Đông Nam','Đông Bắc','Tây Nam','Tây Bắc'].map(h => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>ĐƯỜNG TRƯỚC</label>
              {inp('duong', 'VD: Đường 10m')}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>MÔ TẢ</label>
            <textarea placeholder="Mô tả thêm về lô đất..." value={form.mo_ta}
              onChange={e => setForm(f => ({ ...f, mo_ta: e.target.value }))}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 80, fontFamily: 'sans-serif' }}/>
          </div>

          <button onClick={handleSave} disabled={saving}
            style={{ width: '100%', background: saving ? '#9ca3af' : '#16a34a', color: '#fff', border: 'none', padding: 13, borderRadius: 9, fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Đang lưu...' : '💾 Lưu lô đất'}
          </button>
        </div>

        {/* MAP */}
        <div style={{ flex: 1, position: 'relative' }}>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }}/>
          {isDrawing && (
            <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', background: 'rgba(22,163,74,.9)', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 999, pointerEvents: 'none' }}>
              🖊 Click để thêm điểm · Đã chọn {drawPoints.length} điểm
            </div>
          )}
        </div>
      </div>
    </div>
  )
}