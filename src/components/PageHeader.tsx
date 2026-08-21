import { Icon, type IconName } from '@/components/Icon'

/** 子页面统一页头（玻璃卡片式标题栏） */
export function PageHeader({ title, icon }: { title: string; icon?: IconName }) {
  return (
    <div className="page-header">
      <h1 className="page-title">
        {icon ? <Icon name={icon} size={20} /> : null}
        {title}
      </h1>
    </div>
  )
}
