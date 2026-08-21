import { Link } from 'react-router-dom'
import { Icon } from '@/components/Icon'
import { useLang } from '@/hooks/useLang'
import { useTitle } from '@/hooks/useUi'

/** 404 页：GitHub Pages 下未知路径由 public/404.html 重定向到首页处理 */
export default function NotFoundPage() {
  const { t } = useLang()
  useTitle(t('pageNotFound'))
  return (
    <div className="container">
      <div className="card notfound">
        <div className="notfound-code">404</div>
        <p className="notfound-text">{t('pageNotFound')}</p>
        <Link className="notfound-back" to="/">
          <Icon name="arrow-left" size={14} /> {t('backToHome')}
        </Link>
      </div>
    </div>
  )
}
