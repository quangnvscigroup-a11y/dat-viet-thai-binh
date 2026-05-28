'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

const TYPE_LBL: any = { tho_cu: 'Thổ cư', du_an: 'Dự án', nong_nghiep: 'Nông nghiệp' }
const STATUS_LBL: any = { dang_ban: '🟢 Đang bán', dat_coc: '🟡 Đặt cọc', da_ban: '🔴 Đã bán' }
const STATUS_COLOR: any = { dang_ban: '#16a34a', dat_coc: '#d97706', da_ban: '#dc2626' }
const HUONG_ICON: any = { 'Đông': '→', 'Tây': '←', 'Nam': '↓', 'Bắc': '↑', 'Đông Nam': '↘', 'Đông Bắc': '↗', 'Tây Nam': '↙', 'Tây Bắc': '↖' }

export default function LotDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [lot, setLot] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showPhone, setShowPhone] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [contact, setContact] = useState({ name: '', phone: '', note: '' })
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase.from('lots').select('*').eq('id', id).single()
      .then(({ data }) => { setLot(data); setLoading(false) })
  }, [id])

  useEffect(() => {
    if (!lot || mapLoaded) return
    if (typeof window === 'undefined') return
    setMapLoaded(true)

    import('leaflet').then((L) => {
      const el = document.getElementById('detail-map')
      if (!el || (el as any)._leaflet_id) return

      const map = L.map('detail-map').setView([20.537, 106.337], 17)

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri', maxZoom: 20, maxNativeZoom: 19
      }).addTo(map)

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 20, opacity: 0.8
      }).addTo(map)

      if (lot.coords && lot.coords.length >= 3) {
        const color = lot.status === 'da_ban' ? '#dc2626' :
          lot.type === 'tho_cu' ? '#16a34a' :
          lot.type === 'du_an' ? '#2563eb' : '#d97706'

        const poly = L.polygon(lot.coords, {
          color, weight: 3, fillColor: color, fillOpacity: 0.35
        }).addTo(map)

        map.fitBounds(poly.getBounds(), { padding: [40, 40] })

        L.popup({ closeButton: false })
          .setLatLng(poly.getBounds().getCenter())
          .setContent(`<div style="font-family:sans-serif;font-size:13px;font-weight:700">${lot.name}</div>`)
          .openOn(map)
      }
    })
  }, [lot])

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#6b7280' }}>
      Đang tải...
    </div>
  )

  if (!lot) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Không tìm thấy lô đất</div>
        <button onClick={() => router.push('/')} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer' }}>← Quay lại</button>
      </div>
    </div>
  )

  const priceM2 = lot.dien_tich > 0 ? Math.round(lot.price * 1000000 / lot.dien_tich / 1000) : 0
  const commission = Math.round(lot.price * 10000) // 1% hoa hồng

  return (
    <div style={{ fontFamily: 'Be Vietnam Pro, sans-serif', background: '#f9fafb', minHeight: '100vh' }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>

      {/* HEADER */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: '1px solid #e5e7eb', color: '#6b7280', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>← Bản đồ</button>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Chi tiết lô đất</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { navigator.clipboard?.writeText(window.location.href); alert('Đã copy link!') }}
            style={{ background: 'none', border: '1px solid #e5e7eb', color: '#6b7280', padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
            🔗 Chia sẻ
          </button>
          <button style={{ background: 'none', border: '1px solid #e5e7eb', color: '#6b7280', padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
            🤍 Yêu thích
          </button>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 20px', fontSize: 13, color: '#6b7280' }}>
        <a href="/" style={{ color: '#6b7280' }}>Trang chủ</a> › <a href="/" style={{ color: '#6b7280' }}>Mua bán đất</a> › <span style={{ color: '#111827', fontWeight: 500 }}>{lot.name}</span>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 60px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>

        {/* LEFT */}
        <div>
          {/* ẢNH PLACEHOLDER */}
          <div style={{ background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', borderRadius: 14, height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
            <div style={{ textAlign: 'center', color: '#059669' }}>
              <div style={{ fontSize: 64, marginBottom: 8 }}>🏡</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Chưa có ảnh</div>
              <div style={{ fontSize: 13, opacity: .7 }}>Người đăng chưa upload ảnh</div>
            </div>
            <div style={{ position: 'absolute', top: 16, left: 16, background: STATUS_COLOR[lot.status], color: '#fff', fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20 }}>
              {STATUS_LBL[lot.status]}
            </div>
          </div>

          {/* TITLE */}
          <div style={{ background: '#fff', borderRadius: 10, padding: 20, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 10, lineHeight: 1.3 }}>{lot.name}</h1>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: '#16a34a' }}>{Number(lot.price).toLocaleString('vi-VN')} triệu</div>
              {priceM2 > 0 && <div style={{ fontSize: 15, color: '#6b7280' }}>≈ {priceM2}k/m²</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {[
                [`📐 ${lot.dien_tich} m²`],
                lot.ngang && lot.dai ? [`↔️ ${lot.ngang}×${lot.dai}m`] : null,
                lot.huong ? [`${HUONG_ICON[lot.huong] || '🧭'} ${lot.huong}`] : null,
                lot.duong ? [`🛣 ${lot.duong}`] : null,
              ].filter(Boolean).map((tag: any, i) => (
                <span key={i} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 20, padding: '5px 12px', fontSize: 13, color: '#374151' }}>{tag[0]}</span>
              ))}
              <span style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 20, padding: '5px 12px', fontSize: 13, color: '#166534', fontWeight: 600 }}>{TYPE_LBL[lot.type]}</span>
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>
              {lot.to_so && `Tờ số: ${lot.to_so} · `}
              {lot.thua_so && `Thửa số: ${lot.thua_so} · `}
              Mã tin: {lot.id?.slice(0, 8).toUpperCase()}
            </div>
          </div>

          {/* THÔNG TIN CHI TIẾT */}
          <div style={{ background: '#fff', borderRadius: 10, padding: 20, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 3, height: 18, background: '#16a34a', borderRadius: 2, display: 'inline-block' }}/>
              Thông tin chi tiết
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              {[
                ['Loại đất', TYPE_LBL[lot.type]],
                ['Diện tích', `${lot.dien_tich} m²`],
                lot.ngang ? ['Chiều ngang', `${lot.ngang} m`] : null,
                lot.dai ? ['Chiều dài', `${lot.dai} m`] : null,
                lot.huong ? ['Hướng', lot.huong] : null,
                lot.duong ? ['Đường trước', lot.duong] : null,
                lot.to_so ? ['Tờ số', lot.to_so] : null,
                lot.thua_so ? ['Thửa số', lot.thua_so] : null,
                ['Trạng thái', STATUS_LBL[lot.status]],
                ['Đơn giá', `≈ ${priceM2}k/m²`],
              ].filter(Boolean).map((row: any, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6', gap: 12 }}>
                  <span style={{ fontSize: 14, color: '#6b7280' }}>{row[0]}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#111827', textAlign: 'right' }}>{row[1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* MÔ TẢ */}
          {lot.mo_ta && (
            <div style={{ background: '#fff', borderRadius: 10, padding: 20, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 3, height: 18, background: '#16a34a', borderRadius: 2, display: 'inline-block' }}/>
                Mô tả
              </h2>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8 }}>{lot.mo_ta}</p>
            </div>
          )}

          {/* BẢN ĐỒ */}
          <div style={{ background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 3, height: 18, background: '#16a34a', borderRadius: 2, display: 'inline-block' }}/>
              Vị trí trên bản đồ
            </h2>
            <div id="detail-map" style={{ height: 340, borderRadius: 10, overflow: 'hidden' }}/>
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>

          {/* HOA HỒNG */}
          <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1.5px solid #86efac', borderRadius: 10, padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', marginBottom: 8 }}>💰 Hoa hồng cho bạn</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#16a34a', marginBottom: 4 }}>{commission.toLocaleString('vi-VN')} ₫</div>
            <div style={{ fontSize: 12, color: '#166534', lineHeight: 1.6 }}>Nhận <strong>1% giá trị</strong> khi lô đất bán thành công. Thanh toán trong 7 ngày sau ký hợp đồng.</div>
          </div>

          {/* LIÊN HỆ */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f9fafb', borderRadius: 9, padding: 14, marginBottom: 16 }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fff', fontWeight: 700, flexShrink: 0 }}>N</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Nguyễn Văn Nam</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Chủ đất · Đã xác minh</div>
                <div style={{ fontSize: 11, background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginTop: 3, fontWeight: 600 }}>✅ Chính chủ</div>
              </div>
            </div>

            <button onClick={() => setShowPhone(p => !p)}
              style={{ width: '100%', background: '#16a34a', color: '#fff', border: 'none', padding: 13, borderRadius: 9, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              📞 {showPhone ? '0912.345.678' : 'Hiện số điện thoại'}
            </button>

            <button style={{ width: '100%', background: '#0068ff', color: '#fff', border: 'none', padding: 13, borderRadius: 9, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              💬 Chat Zalo
            </button>

            <button onClick={() => setShowForm(f => !f)}
              style={{ width: '100%', background: 'none', border: '1.5px solid #16a34a', color: '#16a34a', padding: 12, borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              ✉️ Gửi yêu cầu tư vấn
            </button>

            {showForm && (
              <div style={{ marginTop: 16, borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Để lại thông tin</div>
                {[['name','Họ và tên *'],['phone','Số điện thoại *'],].map(([k,p]) => (
                  <input key={k} placeholder={p} value={(contact as any)[k]}
                    onChange={e => setContact(c => ({ ...c, [k]: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, marginBottom: 8, outline: 'none', boxSizing: 'border-box' }}/>
                ))}
                <textarea placeholder="Nội dung..." value={contact.note}
                  onChange={e => setContact(c => ({ ...c, note: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, marginBottom: 8, outline: 'none', resize: 'vertical', minHeight: 70, fontFamily: 'sans-serif', boxSizing: 'border-box' }}/>
                <button onClick={() => { alert('✅ Đã gửi! Chúng tôi sẽ liên hệ sớm.'); setShowForm(false) }}
                  style={{ width: '100%', background: '#16a34a', color: '#fff', border: 'none', padding: 10, borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  Gửi yêu cầu →
                </button>
              </div>
            )}
          </div>

          {/* AN TOÀN */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>⚠️ Lưu ý an toàn</div>
            {['Xem trực tiếp lô đất trước khi đặt cọc','Kiểm tra sổ đỏ tại văn phòng đăng ký đất đai','Ký hợp đồng công chứng, không giao tiền tay'].map((t, i) => (
              <div key={i} style={{ fontSize: 12, color: '#6b7280', marginBottom: 6, paddingLeft: 16, position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0 }}>•</span>{t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}