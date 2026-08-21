import { useEffect, useState } from 'react'
import { Icon } from '@/components/Icon'
import { useLang } from '@/hooks/useLang'
import { getHits, incrementHits } from '@/lib/like'
import { getStorage, likedKey, setStorage } from '@/lib/storage'

/** 文章点赞按钮：计数来自 iine 后端，本地记录防重复 */
export function LikeButton({ path }: { path: string }) {
  const { t } = useLang()
  const [count, setCount] = useState(0)
  const [liked, setLiked] = useState(() => !!getStorage(likedKey(path)))
  const [pop, setPop] = useState(false)

  useEffect(() => {
    let cancelled = false
    getHits([path])
      .then((data) => {
        if (cancelled) return
        const n = typeof data[path] === 'number' ? data[path] : 0
        setCount(liked ? Math.max(n, 1) : n)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [path, liked])

  const onClick = () => {
    if (liked) return
    setLiked(true)
    setStorage(likedKey(path), '1')
    setCount((c) => c + 1)
    setPop(true)
    incrementHits(path).catch(() => {})
  }

  return (
    <div className="post-like-wrap">
      <span className="post-like-text">{t('likeThis')}</span>
      <button
        type="button"
        className={`iine-button${liked ? ' clicked' : ''}`}
        onClick={onClick}
        aria-pressed={liked}
        title={liked ? t('liked') : undefined}
        aria-label={`${count} ${t('likes')}`}
      >
        <span className={`icon${pop ? ' pop' : ''}`}>
          <Icon name="heart" size={16} fill={liked ? 'currentColor' : 'none'} />
        </span>
        <span className="counter"> {count}</span>
      </button>
    </div>
  )
}
