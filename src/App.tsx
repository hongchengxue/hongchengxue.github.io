import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { CursorRing } from '@/components/CursorRing'
import { Footer } from '@/components/Footer'
import { NavBar } from '@/components/NavBar'
import { ScrollToTop, useNavHidden } from '@/hooks/useUi'
import ArchivesPage from '@/pages/ArchivesPage'
import CategoriesPage from '@/pages/CategoriesPage'
import CategoryDetailPage from '@/pages/CategoryDetailPage'
import GamesPage from '@/pages/GamesPage'
import HomePage from '@/pages/HomePage'
import IntroPage from '@/pages/IntroPage'
import NotFoundPage from '@/pages/NotFoundPage'
import SearchPage from '@/pages/SearchPage'
import TagDetailPage from '@/pages/TagDetailPage'
import TagsPage from '@/pages/TagsPage'
import ToolsPage from '@/pages/ToolsPage'

/**
 * 懒加载页面：重型依赖（marked / DOMPurify / highlight.js / GitHub 逻辑）
 * 只在这些页面被访问时才下载，缩小首屏体积。
 */
const PostPage = lazy(() => import('@/pages/PostPage'))
const WritePage = lazy(() => import('@/pages/WritePage'))

/** 页面级加载占位 */
function PageLoading() {
  return (
    <div className="container">
      <div className="card page-loading">加载中…</div>
    </div>
  )
}

/** 站点骨架：导航 + 内容 + 页脚 */
function SiteLayout() {
  const { pathname } = useLocation()
  // 首页为浅色 hero，导航统一使用实底玻璃（深色字）；向下滚动收起、向上弹出
  const navHidden = useNavHidden()
  const isWrite = pathname.startsWith('/write')

  return (
    <div id="app">
      {!isWrite && <NavBar solid hidden={navHidden} />}
      <main id="main" className={isWrite ? 'main-full' : ''}>
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </main>
      {!isWrite && <Footer />}
    </div>
  )
}

/** 路由表：路径保持与旧站（Hexo 永久链接）一致 */
export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      {/* MiMo 光圈自定义光标（全站） */}
      <CursorRing />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="archives/" element={<ArchivesPage />} />
          {/* 文章永久链接：/2026/08/15/hello-world/ */}
          <Route path=":year/:month/:day/:slug/" element={<PostPage />} />
          <Route path="categories/" element={<CategoriesPage />} />
          <Route path="categories/*" element={<CategoryDetailPage />} />
          <Route path="tags/" element={<TagsPage />} />
          <Route path="tags/:name/" element={<TagDetailPage />} />
          <Route path="search/" element={<SearchPage />} />
          {/* 关于我已并入首页，旧链接重定向 */}
          <Route path="about/" element={<Navigate to="/" replace />} />
          <Route path="intro/" element={<IntroPage />} />
          <Route path="games/" element={<GamesPage />} />
          <Route path="tools/" element={<ToolsPage />} />
          <Route path="write/" element={<WritePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
