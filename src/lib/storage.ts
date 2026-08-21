/**
 * localStorage 读写封装：统一 try/catch 与键名管理。
 * 键名沿用旧站点，保留用户已保存的偏好（语言 / 写作台令牌 / 点赞记录）。
 */
export const STORAGE_KEYS = {
  /** 语言偏好：zh | en（沿用旧站键名） */
  lang: 'site-lang',
  /** 主题偏好：light | dark（空 = 跟随系统） */
  theme: 'hxc:theme',
  /** 写作台 GitHub 令牌（沿用旧站键名） */
  writeToken: 'write-token',
  /** 点赞记录前缀，后接文章路径 */
  likedPrefix: 'hxc-liked-',
} as const

export function getStorage(key: string, fallback = ''): string {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

export function setStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // 隐私模式等场景下写入失败可忽略
  }
}

export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export function likedKey(path: string): string {
  return STORAGE_KEYS.likedPrefix + path
}
