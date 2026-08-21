import { Icon } from '@/components/Icon'
import { useTheme } from '@/hooks/useTheme'
import { useLang } from '@/hooks/useLang'

/** 夜间模式切换按钮（导航栏最右侧） */
export function DarkModeToggle() {
  const { theme, toggle } = useTheme()
  const { t } = useLang()
  return (
    <button
      type="button"
      className="darkmode-btn"
      onClick={toggle}
      aria-label={t('darkMode')}
      title={t('darkMode')}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={14} />
    </button>
  )
}
