import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { Icon, type IconName } from '@/components/Icon'
import { LangSwitch } from '@/components/LangSwitch'
import { SearchBar } from '@/components/SearchBar'
import { useLang } from '@/hooks/useLang'
import type { I18nKey } from '@/lib/i18n'

/** 菜单配置（模块级常量，避免每次渲染重建） */
const NAV_ITEMS: { to: string; label: I18nKey; icon: IconName; end?: boolean }[] = [
  { to: '/', label: 'home', icon: 'home', end: true },
  { to: '/archives/', label: 'articles', icon: 'archive' },
  { to: '/games/', label: 'games', icon: 'gamepad' },
  { to: '/tools/', label: 'tools', icon: 'tools' },
  { to: '/write/', label: 'write', icon: 'pen' },
]

interface NavBarProps {
  /** 是否处于"实底"态：滚动后或非首页时文字/背景切换为浅色方案 */
  solid: boolean
}

export function NavBar({ solid }: NavBarProps) {
  const { t } = useLang()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header id="page-header" className={solid ? 'nav-solid' : 'nav-hero'}>
      <nav id="nav" className="nav-inner">
        <ul className="nav-menus" role="menubar">
          {NAV_ITEMS.map((item) => (
            <li key={item.to} role="none">
              <NavLink
                to={item.to}
                end={item.end}
                role="menuitem"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                <Icon name={item.icon} size={13} />
                <span>{t(item.label)}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          <SearchBar />
          <NavLink
            className={({ isActive }) => (isActive ? 'nav-link nav-about active' : 'nav-link nav-about')}
            to="/about/"
          >
            <Icon name="user" size={13} />
            <span>ABOUT ME</span>
          </NavLink>
          <LangSwitch />
          <DarkModeToggle />
          <button
            type="button"
            className="nav-burger"
            aria-label="menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <Icon name={mobileOpen ? 'close' : 'menu'} size={18} />
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="nav-mobile-menu">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setMobileOpen(false)}
            >
              <Icon name={item.icon} size={14} />
              <span>{t(item.label)}</span>
            </NavLink>
          ))}
          <NavLink
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            to="/about/"
            onClick={() => setMobileOpen(false)}
          >
            <Icon name="user" size={14} />
            <span>ABOUT ME</span>
          </NavLink>
        </div>
      )}
    </header>
  )
}
