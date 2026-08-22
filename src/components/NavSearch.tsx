import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/Icon'
import { useLang } from '@/hooks/useLang'

/**
 * 导航搜索：默认是一个圆形搜索按钮，
 * 点击后在按钮左侧弹出搜索栏（回车或点击箭头跳转 /search/?q=...）。
 */
export function NavSearch() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 展开时：聚焦输入框；点击外部或按 Esc 关闭
  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const go = () => {
    const v = value.trim()
    if (!v) return
    navigate(`/search/?q=${encodeURIComponent(v)}`)
    setOpen(false)
  }

  return (
    <div ref={wrapRef} className={`nav-search${open ? ' open' : ''}`}>
      <button
        type="button"
        className="nav-search-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label={t('search')}
        aria-expanded={open}
        title={t('search')}
      >
        <Icon name="search" size={15} />
      </button>
      {open ? (
        <div className="nav-search-pop" role="search">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') go()
            }}
            placeholder={t('searchPlaceholder')}
            aria-label={t('search')}
            autoComplete="off"
          />
        </div>
      ) : null}
    </div>
  )
}
