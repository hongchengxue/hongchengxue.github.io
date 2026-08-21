import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
// 侧效应引入中文本地化词典（设置 window.VditorI18n），
// 配合下方 i18n 选项让编辑器同步初始化，完全不依赖外部 CDN
import 'vditor/dist/js/i18n/zh_CN.js'
import { useTheme } from '@/hooks/useTheme'

/**
 * Typora 式所见即所得编辑器（Vditor 即时渲染模式）。
 * - mode: 'ir' —— 输入即渲染；点击某一段落，该段就地显示 Markdown 源码，点击其他位置恢复渲染
 * - 中文输入法友好（Vditor 专为中文场景设计）
 * - 图片上传通过 uploadImages 回调交给调用方（写作台上传到 GitHub）
 * - 主题跟随站点深色模式（setTheme 同步）
 */
export interface VditorEditorHandle {
  /** 程序化设置内容（加载文章 / 清空时调用） */
  setValue: (md: string) => void
  /** 获取当前内容 */
  getValue: () => string
}

interface VditorEditorProps {
  initialValue?: string
  height?: number
  placeholder?: string
  /** 编辑器输入事件（同步内容到父级状态） */
  onInput?: (md: string) => void
  /** 图片上传：成功返回 `![alt](url)`（由编辑器插入），失败返回错误信息（编辑器以提示展示） */
  uploadImages?: (files: File[]) => Promise<string | null>
}

export const VditorEditor = forwardRef<VditorEditorHandle, VditorEditorProps>(function VditorEditor(
  { initialValue = '', height = 640, placeholder, onInput, uploadImages },
  ref,
) {
  const elRef = useRef<HTMLDivElement>(null)
  const vditorRef = useRef<Vditor | null>(null)
  const { theme } = useTheme()

  // Vditor 只在挂载时读取一次配置，回调经 ref 间接取最新值，避免闭包过期
  const initRef = useRef({ initialValue, height, placeholder })
  const onInputRef = useRef(onInput)
  const uploadRef = useRef(uploadImages)

  // 每次渲染后同步最新值到 ref（写入放在 effect 中，符合 React Compiler 规范）
  useEffect(() => {
    initRef.current = { initialValue, height, placeholder }
    onInputRef.current = onInput
    uploadRef.current = uploadImages
  })

  useEffect(() => {
    const el = elRef.current
    if (!el) return
    const init = initRef.current
    let instance: Vditor | null = null

    const v = new Vditor(el, {
      mode: 'ir',
      value: init.initialValue,
      height: init.height,
      placeholder: init.placeholder ?? '',
      lang: 'zh_CN',
      theme: 'classic',
      // 全部资源走本站路径，不依赖 unpkg CDN（国内常被拦截导致编辑器崩溃）
      cdn: '/vditor',
      _lutePath: '/vditor/dist/js/lute/lute.min.js',
      // 传入完整本地化词典 → 构造函数同步初始化（绕开 CDN i18n 异步加载）
      i18n: window.VditorI18n,
      cache: { enable: false },
      toolbarConfig: { pin: true },
      toolbar: [
        'headings',
        'bold',
        'italic',
        'strike',
        '|',
        'list',
        'ordered-list',
        'check',
        'quote',
        'line',
        '|',
        'code',
        'inline-code',
        'link',
        'table',
        'image',
        'upload',
        '|',
        'undo',
        'redo',
        '|',
        'fullscreen',
        'edit-mode',
      ],
      input: (value) => onInputRef.current?.(value),
      upload: {
        accept: 'image/*',
        multiple: true,
        max: 8 * 1024 * 1024,
        // 自定义上传：成功 → insertValue 插入图片语法并返回 null；失败 → 返回错误信息（Vditor 以提示展示）
        handler: (async (files: File[]) => {
          const result = await uploadRef.current?.(files)
          if (result && result.startsWith('![')) {
            instance?.insertValue(result)
            return null
          }
          return result ?? null
        }) as unknown as (files: File[]) => string | Promise<string> | Promise<null> | null,
      },
    })
    instance = v
    vditorRef.current = v

    return () => {
      v.destroy()
      vditorRef.current = null
    }
  }, [])

  // 站点主题变化 → 同步编辑器主题
  useEffect(() => {
    vditorRef.current?.setTheme(theme === 'dark' ? 'dark' : 'classic')
  }, [theme])

  useImperativeHandle(
    ref,
    () => ({
      setValue: (md: string) => vditorRef.current?.setValue(md),
      getValue: () => vditorRef.current?.getValue() ?? '',
    }),
    [],
  )

  return <div ref={elRef} className="vditor-mount" />
})
