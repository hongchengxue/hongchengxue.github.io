import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { useLang } from '@/hooks/useLang'

/** 微信分享弹层：本地生成二维码 */
function QrModal({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const [dataUrl, setDataUrl] = useState('')
  useEffect(() => {
    void QRCode.toDataURL(url, { width: 220, margin: 1 }).then(setDataUrl).catch(() => setDataUrl(''))
  }, [url])
  return (
    <div className="share-qr-mask" onClick={onClose}>
      <div className="share-qr-card" onClick={(e) => e.stopPropagation()}>
        {dataUrl ? <img src={dataUrl} alt="微信扫码分享" /> : <p>二维码生成中…</p>}
        <p className="share-qr-title">{title}</p>
        <p className="share-qr-tip">打开微信「扫一扫」分享这篇文章</p>
        <button type="button" onClick={onClose}>
          关闭
        </button>
      </div>
    </div>
  )
}

/* 平台图标：简单内联图形（stroke 风格，随 currentColor） */
function WechatIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8.5 4.5C4.9 4.5 2 6.9 2 9.9c0 1.7 1 3.2 2.5 4.1l-.6 2.2 2.5-1.2c.7.2 1.4.3 2.1.3" />
      <path d="M22 14.3c0-2.7-2.6-4.9-5.8-4.9s-5.8 2.2-5.8 4.9 2.6 4.9 5.8 4.9c.8 0 1.5-.1 2.1-.3l2.1 1-.5-1.9c1.2-.9 2.1-2.2 2.1-3.8z" />
    </svg>
  )
}

function InsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.5 9.3v5.4l4.8-2.7z" fill="currentColor" stroke="none" />
    </svg>
  )
}

interface ShareItem {
  key: string
  label: string
  title: string
  /** 品牌色 */
  color: string
  /** 打开链接（新窗口） */
  url?: (u: string, t: string) => string
  /** 需要二维码弹层 */
  qr?: boolean
  /** 仅复制链接 */
  copy?: boolean
}

const SHARE_ITEMS: ShareItem[] = [
  {
    key: 'qq',
    label: 'Q',
    title: 'QQ',
    color: '#12b7f5',
    url: (u, t) => `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}`,
  },
  { key: 'wechat', label: '微信', title: '微信', color: '#07c160', qr: true },
  {
    key: 'x',
    label: 'X',
    title: 'X (Twitter)',
    color: '#14171a',
    url: (u, t) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`,
  },
  {
    key: 'weibo',
    label: '微',
    title: '微博',
    color: '#e6162d',
    url: (u, t) => `https://service.weibo.com/share/share.php?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}`,
  },
  { key: 'zhihu', label: '知', title: '知乎', color: '#0084ff', copy: true },
  { key: 'ins', label: 'Ins', title: 'Instagram', color: '#c13584', copy: true },
  { key: 'youtube', label: 'YouTube', title: 'YouTube', color: '#ff0000', copy: true },
]

/** 文章分享栏：品牌色圆形图标，悬停显示平台名 */
export function ShareBar({ url, title }: { url: string; title: string }) {
  const { t } = useLang()
  const [qrOpen, setQrOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('复制链接：', url)
    }
  }

  const renderIcon = (item: ShareItem) => {
    if (item.key === 'wechat') return <WechatIcon />
    if (item.key === 'ins') return <InsIcon />
    if (item.key === 'youtube') return <YoutubeIcon />
    return <span className="share-letter">{item.label}</span>
  }

  return (
    <div className="share-bar">
      <span className="share-bar-label">{t('share')}</span>
      {SHARE_ITEMS.map((item) => {
        const cls = `share-btn share-${item.key}${item.copy ? ' share-copy' : ''}`
        if (item.copy) {
          return (
            <button key={item.key} type="button" className={cls} title={item.title} onClick={copyLink}>
              {renderIcon(item)}
            </button>
          )
        }
        if (item.qr) {
          return (
            <button key={item.key} type="button" className={cls} title={item.title} onClick={() => setQrOpen(true)}>
              {renderIcon(item)}
            </button>
          )
        }
        return (
          <a key={item.key} className={cls} title={item.title} href={item.url?.(url, title)} target="_blank" rel="noopener noreferrer">
            {renderIcon(item)}
          </a>
        )
      })}
      <button
        type="button"
        className="share-btn share-link"
        onClick={copyLink}
        title={t('articleLink')}
      >
        {copied ? '✓' : <span className="share-letter">🔗</span>}
      </button>
      {qrOpen ? <QrModal url={url} title={title} onClose={() => setQrOpen(false)} /> : null}
    </div>
  )
}
