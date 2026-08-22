import { useLang } from '@/hooks/useLang'

/**
 * 语言切换：艺术字体「A」按钮，点击直接切换 中文 ⇄ English。
 * 选择写入 localStorage（site-lang）。
 */
export function LangSwitch() {
  const { lang, setLang, t } = useLang()
  const next: 'zh' | 'en' = lang === 'zh' ? 'en' : 'zh'

  return (
    <div className="lang-wrap">
      <button
        type="button"
        className="lang-btn"
        onClick={() => setLang(next)}
        aria-label="Language"
        title={lang === 'zh' ? t('langEn') : t('langZh')}
      >
        <span className="lang-letter" aria-hidden="true">
          A
        </span>
      </button>
    </div>
  )
}
