import { PageHeader } from '@/components/PageHeader'
import { TagCloud } from '@/components/TagCloud'
import { useLang } from '@/hooks/useLang'
import { useTitle } from '@/hooks/useUi'
import { siteStats } from '@/lib/stats'

/** 标签总览页：标签云 */
export default function TagsPage() {
  const { t } = useLang()
  useTitle(t('tags'))
  return (
    <div className="container">
      <PageHeader title={t('tags')} icon="tag" />
      <div className="card page-card">
        <TagCloud tags={siteStats.tags} />
      </div>
    </div>
  )
}
