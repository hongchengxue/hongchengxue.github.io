import { PageHeader } from '@/components/PageHeader'
import { useLang } from '@/hooks/useLang'
import { useTitle } from '@/hooks/useUi'
import { SITE } from '@/lib/site'

/** 自我介绍页：站点说明 + 联系方式（静态内容，改文案直接编辑本文件） */
export default function IntroPage() {
  const { t } = useLang()
  useTitle(t('intro'))

  return (
    <div className="container">
      <PageHeader title={t('intro')} icon="user" />
      <div className="intro-page">
        <div className="card about-card">
          <h2 className="about-section-title">你好，我是 hong 👋</h2>
          <div className="about-announce">
            <p>欢迎来到我的知识库。这里记录我的<strong>技术文章</strong>和<strong>生活随笔</strong>。</p>
          </div>
        </div>
        <div className="card about-card">
          <h2 className="about-section-title">关于这个网站</h2>
          <ul className="intro-list">
            <li>
              使用 <strong>Vite + React + TypeScript</strong> 构建，纯静态部署
            </li>
            <li>
              托管在{' '}
              <a href="https://pages.github.com/" target="_blank" rel="noopener noreferrer">
                GitHub Pages
              </a>{' '}
              （免费）
            </li>
            <li>文章通过「写作台」或直接提交 Markdown 发布</li>
          </ul>
        </div>
        <div className="card about-card">
          <h2 className="about-section-title">联系我</h2>
          <ul className="intro-list">
            <li>
              GitHub：{' '}
              <a href={SITE.contact.github} target="_blank" rel="noopener noreferrer">
                hongchengxue
              </a>
            </li>
            <li>邮箱：待补充</li>
          </ul>
        </div>
        <div className="card about-card">
          <h2 className="about-section-title">关于我</h2>
          <div className="about-announce">
            <p>这里可以写下更详细的自我介绍：我的经历、兴趣爱好、正在做的事情……</p>
            <blockquote>这段自我介绍可以随时修改，把你想说的话告诉我即可。</blockquote>
          </div>
        </div>
      </div>
    </div>
  )
}
