import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { siInstagram, siQq, siSinaweibo, siWechat, siX, siYoutube, siZhihu } from 'simple-icons'
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

/** 官方品牌图标（simple-icons） */
function BrandIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  )
}

interface ShareItem {
  key: string
  title: string
  /** 品牌色（simple-icons 官方 hex） */
  color: string
  /** 官方图标 path */
  icon: string
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
    title: siQq.title,
    color: `#${siQq.hex}`,
    icon: siQq.path,
    url: (u, t) => `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}`,
  },
  { key: 'wechat', title: siWechat.title, color: `#${siWechat.hex}`, icon: siWechat.path, qr: true },
  {
    key: 'x',
    title: siX.title,
    color: `#${siX.hex}`,
    icon: siX.path,
    url: (u, t) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`,
  },
  {
    key: 'weibo',
    title: siSinaweibo.title,
    color: `#${siSinaweibo.hex}`,
    icon: siSinaweibo.path,
    url: (u, t) => `https://service.weibo.com/share/share.php?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}`,
  },
  { key: 'zhihu', title: siZhihu.title, color: `#${siZhihu.hex}`, icon: siZhihu.path, copy: true },
  { key: 'ins', title: siInstagram.title, color: `#${siInstagram.hex}`, icon: siInstagram.path, copy: true },
  { key: 'youtube', title: siYoutube.title, color: `#${siYoutube.hex}`, icon: siYoutube.path, copy: true },
]

/** 文章分享栏：官方品牌图标 + 品牌色圆底，悬停显示平台名 */
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

  return (
    <div className="share-bar">
      <span className="share-bar-label">{t('share')}</span>
      {SHARE_ITEMS.map((item) => {
        const cls = `share-btn${item.copy ? ' share-copy' : ''}`
        const icon = <BrandIcon path={item.icon} />
        const style = { background: item.color }
        if (item.copy) {
          return (
            <button key={item.key} type="button" className={cls} title={item.title} style={style} onClick={copyLink}>
              {icon}
            </button>
          )
        }
        if (item.qr) {
          return (
            <button key={item.key} type="button" className={cls} title={item.title} style={style} onClick={() => setQrOpen(true)}>
              {icon}
            </button>
          )
        }
        return (
          <a key={item.key} className={cls} title={item.title} style={style} href={item.url?.(url, title)} target="_blank" rel="noopener noreferrer">
            {icon}
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
