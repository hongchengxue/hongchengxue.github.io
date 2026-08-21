import { PageHeader } from '@/components/PageHeader'
import { useLang } from '@/hooks/useLang'
import { useTitle } from '@/hooks/useUi'

/** 工具 hub：占位页，后续在此添加工具卡片 */
export default function ToolsPage() {
  const { t } = useLang()
  useTitle(t('tools'))
  return (
    <div className="container">
      <PageHeader title={t('tools')} icon="tools" />
      <div className="hub-grid">
        <div className="hub-empty">{t('toolsEmpty')}</div>
        <div className="hub-tip">{t('toolsTip')}</div>
      </div>
    </div>
  )
}
