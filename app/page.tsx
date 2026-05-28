'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '../lib/supabase'

const Map = dynamic(() => import('../components/Map'), { ssr: false })

const TYPE_LBL: any = { tho_cu: 'Thổ cư', du_an: 'Dự án', nong_nghiep: 'Nông nghiệp' }
const STATUS_LBL: any = { dang_ban: '🟢 Đang bán', dat_coc: '🟡 Đặt cọc', da_ban: '🔴 Đã bán' }

export default function Home() {
  const [lots, setLots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('lots').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setLots(data || []); setLoading(false) })
  }, [])

  const filtered = lots.filter(l =>
    (filter === 'all' || l.type === filter) &&
    (!search || l.name?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Be Vietnam Pro, sans-serif', background: '#f9fafb' }}>
      
      {/* HEADER */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#16a34a,#059669)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏡</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>Đất Việt <span style={{ color: '#16a34a' }}>Thái Bình</span></div>
            <div style={{ fontSize: 11, color: '#6b7280', letterSpacing: 1 }}>BẢN ĐỒ LÔ ĐẤT – XÃ QUỲNH PHỤ</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ fontSize: 13, color: '#6b7280', background: '#f3f4f6', padding: '5px 12px', borderRadius: 20 }}>
            {filtered.length} lô đất
          </span>
          <a href="/dang-lo" style={{ background: '#16a34a', color: '#fff', padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>+ Đăng lô đất</a>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* SIDEBAR */}
        <div style={{ width: 360, background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Tìm theo tên, giá..." 
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', marginBottom: 10 }}/>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[['all','Tất cả'],['tho_cu','🟢 Thổ cư'],['du_an','🔵 Dự án'],['nong_nghiep','🟡 Nông nghiệp']].map(([val, lbl]) => (
                <button key={val} onClick={() => setFilter(val)}
                  style={{ padding: '5px 12px', borderRadius: 20, border: `1px solid ${filter===val?'#16a34a':'#e5e7eb'}`, background: filter===val?'#16a34a':'none', color: filter===val?'#fff':'#6b7280', fontSize: 12, cursor: 'pointer' }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            {loading && <p style={{ textAlign: 'center', color: '#9ca3af', padding: 40 }}>Đang tải...</p>}
            {!loading && filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🏞</div>
                <p>Chưa có lô đất nào</p>
                <a href="/dang-lo" style={{ color: '#16a34a', fontSize: 13 }}>+ Đăng lô đầu tiên</a>
              </div>
            )}
            {filtered.map(lot => {
              const color = lot.status==='da_ban'?'#f85149': lot.type==='tho_cu'?'#16a34a': lot.type==='du_an'?'#2563eb':'#d97706'
              return (
                <a href={`/lot/${lot.id}`} key={lot.id} style={{ display: 'block', textDecoration: 'none', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 14, marginBottom: 10, borderLeft: `3px solid ${color}`, transition: 'all .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#16a34a')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{lot.name}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${color}20`, color, border: `1px solid ${color}40` }}>
                      {TYPE_LBL[lot.type]}
                    </span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a', marginBottom: 4 }}>
                    {Number(lot.price).toLocaleString('vi-VN')} triệu
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', gap: 10 }}>
                    <span>📐 {lot.dien_tich}m²</span>
                    {lot.duong && <span>🛣 {lot.duong}</span>}
                    <span>{STATUS_LBL[lot.status]}</span>
                  </div>
                </a>
              )
            })}
          </div>
        </div>

        {/* MAP */}
        <div style={{ flex: 1, position: 'relative' }}>
          <Map lots={filtered} />
          <div style={{ position: 'absolute', bottom: 24, left: 16, background: 'rgba(255,255,255,.93)', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', fontSize: 12, zIndex: 999 }}>
            <div style={{ fontWeight: 700, marginBottom: 6, color: '#374151' }}>PHÂN LOẠI</div>
            {[['#16a34a','Thổ cư'],['#2563eb','Dự án'],['#d97706','Nông nghiệp'],['#f85149','Đã bán']].map(([c,l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: '#6b7280' }}>
                <div style={{ width: 10, height: 10, background: c, borderRadius: 2 }}/>
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}