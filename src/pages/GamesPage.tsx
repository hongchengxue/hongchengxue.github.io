import { PageHeader } from '@/components/PageHeader'
import { useLang } from '@/hooks/useLang'
import { useTitle } from '@/hooks/useUi'

/** 游戏 hub：卡片链接到 public/games 下的静态游戏页 */
export default function GamesPage() {
  const { t } = useLang()
  useTitle(t('games'))

  const games = [
    { url: '/games/gomoku/', icon: '⚫', title: t('gamesGomoku'), desc: t('gamesGomokuDesc') },
    { url: '/games/snake/', icon: '🐍', title: t('gamesSnake'), desc: t('gamesSnakeDesc') },
  ]

  return (
    <div className="container">
      <PageHeader title={t('games')} icon="gamepad" />
      <div className="hub-grid">
        {games.map((g) => (
          <a key={g.url} className="hub-card" href={g.url}>
            <div className="hub-card-icon">{g.icon}</div>
            <div className="hub-card-title">{g.title}</div>
            <div className="hub-card-desc">{g.desc}</div>
          </a>
        ))}
      </div>
    </div>
  )
}
