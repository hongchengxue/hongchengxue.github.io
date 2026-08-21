import { Link } from 'react-router-dom'
import { Icon } from '@/components/Icon'
import { useLang } from '@/hooks/useLang'
import { SITE } from '@/lib/site'

/** 页脚：版权 + 分类/标签快捷入口 + 技术栈说明 */
export function Footer() {
  const { t } = useLang()
  return (
    <footer id="footer">
      <div className="footer-inner">
        <div className="footer-links">
          <Link to="/categories/">{t('categories')}</Link>
          <span className="footer-dot">·</span>
          <Link to="/tags/">{t('tags')}</Link>
          <span className="footer-dot">·</span>
          <a href={SITE.contact.github} target="_blank" rel="noopener noreferrer">
            <Icon name="github" size={13} /> GitHub
          </a>
        </div>
        <div className="footer-meta">
          <span>
            Copyright {SITE.since}-{new Date().getFullYear()} {SITE.author}
          </span>
          <span className="footer-dot">·</span>
          <span>{t('footerPowered')}</span>
        </div>
      </div>
    </footer>
  )
}
