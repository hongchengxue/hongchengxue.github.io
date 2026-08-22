import { useEffect, useRef, useState } from 'react'
import { useLang } from '@/hooks/useLang'
import type { Lang } from '@/lib/i18n'

const OPTIONS: { value: Lang; label: string }[] = [
  { value: 'zh', label: '简体中文' },
  { value: 'en', label: 'English' },
]

/**
 * 语言切换：艺术字体「A」字按钮，悬停弹出选项（移动端点击切换）。
 * 选择写入 localStorage（site-lang）。
 */
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
        aria-label="Language"
        title={lang === 'zh' ? t('langZh') : t('langEn')}
      >
        <span className="lang-letter" aria-hidden="true">
          A
        </span>
      </button>
      <div className="lang-menu" role="listbox" aria-label="Language">
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
