import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/Icon'
import { useLang } from '@/hooks/useLang'
import type { Lang } from '@/lib/i18n'

const OPTIONS: { value: Lang; label: string }[] = [
  { value: 'zh', label: '简体中文' },
  { value: 'en', label: 'English' },
]

/** 语言切换：玻璃下拉面板，选择写入 localStorage（site-lang） */
export function LangSwitch() {
  const { lang, setLang, t } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  return (
    <div ref={ref} className={`lang-wrap${open ? ' open' : ''}`}>
      <button
        type="button"
        className="lang-btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Icon name="globe" size={13} />
        <span>{lang === 'zh' ? t('langZh') : t('langEn')}</span>
        <Icon name="chevron-down" size={12} className="lang-caret" />
      </button>
      <div className="lang-menu" role="listbox" aria-label={t('search')}>
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            role="option"
            aria-selected={lang === o.value}
            className={`lang-option${lang === o.value ? ' active' : ''}`}
            onClick={() => {
              setLang(o.value)
              setOpen(false)
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
