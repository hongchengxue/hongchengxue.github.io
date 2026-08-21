import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/Icon'
import { useLang } from '@/hooks/useLang'

/**
 * 站内搜索框（导航栏统一使用）：回车或点击按钮 → 跳转 /search/?q=...
 */
export function SearchBar() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [value, setValue] = useState('')

  const go = () => {
    const v = value.trim()
    if (!v) return
    navigate(`/search/?q=${encodeURIComponent(v)}`)
  }

  return (
    <div className="search-bar">
      <input
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
      <button
        type="button"
        className={value.trim() ? 'visible' : ''}
        onClick={go}
        aria-label={t('search')}
      >
        <Icon name="arrow-right" size={15} />
      </button>
    </div>
  )
}
