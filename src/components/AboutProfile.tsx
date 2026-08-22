import { Link } from 'react-router-dom'
import { Icon } from '@/components/Icon'
import { TagCloud } from '@/components/TagCloud'
import { useLang } from '@/hooks/useLang'
import { SITE } from '@/lib/site'
import { siteStats } from '@/lib/stats'

/** 个人介绍卡片区（首页与关于页共用）：头像 / 联系 / 统计 / 简介 / 标签云 */
export function AboutProfile() {
  const { t } = useLang()
  return (
    <div className="about-page">
      <div className="card about-card">
        <div className="about-header">
          <img className="about-avatar" src="/img/avatar.png" alt="avatar" />
          <div>
            <div className="about-name">{SITE.author}</div>
            <div className="about-intro">{t('aboutIntro')}</div>
            <div className="about-contact">
              <a href={SITE.contact.github} target="_blank" rel="noopener noreferrer">
                <Icon name="github" size={14} /> GitHub
              </a>
              <a href={SITE.contact.email}>
                <Icon name="mail" size={14} /> Email
              </a>
              <Link to="/intro/">
                <Icon name="ellipsis" size={14} /> more
              </Link>
            </div>
          </div>
        </div>
        <div className="about-stats">
          <Link className="about-stat about-stat-link" to="/archives/">
            <span className="about-stat-num">{siteStats.total}</span>
            <span>{t('postCount')}</span>
          </Link>
          <div className="about-stat">
            <span className="about-stat-num">{siteStats.tags.length}</span>
            <span>{t('tags')}</span>
          </div>
          <Link className="about-stat about-stat-link" to="/categories/">
            <span className="about-stat-num">{siteStats.categories.length}</span>
            <span>{t('categories')}</span>
          </Link>
          <div className="about-stat">
            <span className="about-stat-num">{siteStats.lastUpdated}</span>
            <span>{t('lastUpdated')}</span>
          </div>
        </div>
        <div className="about-bio">
          <p>{t('aboutBio1')}</p>
          <p>{t('aboutBio2')}</p>
        </div>
      </div>

      <div className="card about-card">
        <div className="about-section-title">
          <Icon name="tag" size={15} /> {t('tagCloud')}
        </div>
        <TagCloud tags={siteStats.tags} />
      </div>
    </div>
  )
}
