import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Icon } from '@/components/Icon'
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

interface ShareItem {
  key: string
  label: string
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
    label: 'QQ',
    url: (u, t) => `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}`,
  },
  { key: 'wechat', label: '微信', qr: true },
  {
    key: 'x',
    label: 'X',
    url: (u, t) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`,
  },
  {
    key: 'weibo',
    label: '微博',
    url: (u, t) => `https://service.weibo.com/share/share.php?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}`,
  },
  { key: 'zhihu', label: '知乎', copy: true },
  { key: 'ins', label: 'Ins', copy: true },
  { key: 'youtube', label: 'YouTube', copy: true },
]

/** 文章分享栏：QQ / 微信(二维码) / X / 微博 / 知乎 / Ins / YouTube(复制链接) */
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
      // 剪贴板不可用时回退
      window.prompt('复制链接：', url)
    }
  }

  return (
    <div className="share-bar">
      <span className="share-bar-label">{t('share')}</span>
      {SHARE_ITEMS.map((item) => {
        if (item.copy) {
          return (
            <button key={item.key} type="button" className="share-btn" title={`${item.label}：复制链接`} onClick={copyLink}>
              {item.label}
            </button>
          )
        }
        if (item.qr) {
          return (
            <button key={item.key} type="button" className="share-btn" title={item.label} onClick={() => setQrOpen(true)}>
              {item.label}
            </button>
          )
        }
        return (
          <a
            key={item.key}
            className="share-btn"
            title={item.label}
            href={item.url?.(url, title)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.label}
          </a>
        )
      })}
      <button type="button" className="share-btn" onClick={copyLink} title={t('articleLink')}>
        {copied ? '✅' : <Icon name="link" size={13} />}
      </button>
      {qrOpen ? <QrModal url={url} title={title} onClose={() => setQrOpen(false)} /> : null}
    </div>
  )
}
