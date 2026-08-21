import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/Icon'
import { useLang } from '@/hooks/useLang'

/**
 * 站内搜索框：回车或点击按钮 → 跳转 /search/?q=...
 * variant: nav（导航栏药丸） | hero（首页英雄区大号）
 */
export function SearchBar({ variant }: { variant: 'nav' | 'hero' }) {
  const { t } = useLang()
  const navigate = useNavigate()
  const [value, setValue] = useState('')

  const go = () => {
    const v = value.trim()
    if (!v) return
    navigate(`/search/?q=${encodeURIComponent(v)}`)
  }

  return (
    <div className={`search-bar search-bar-${variant}`}>
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
        <Icon name="arrow-right" size={variant === 'hero' ? 18 : 15} />
      </button>
    </div>
  )
}
