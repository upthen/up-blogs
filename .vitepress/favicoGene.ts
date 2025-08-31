import { createCanvas } from 'canvas'

// 动态生成 SVG 字符串（兼容浏览器环境）
export const generateHanziSVG = (
  text: string,
  options = {
    size: 32,
    bgColor: '#000',
    textColor: 'white',
  }
) => {
  // 浏览器环境使用 DOM（构建时自动降级）
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas')
    canvas.width = options.size
    canvas.height = options.size
    const ctx = canvas.getContext('2d')!

    // 绘制背景
    ctx.fillStyle = options.bgColor
    ctx.fillRect(0, 0, options.size, options.size)

    // 绘制文字（居中）
    ctx.font = `${options.size * 0.7}px PingFang SC, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = options.textColor
    ctx.fillText(text, options.size / 2, options.size / 2)

    return canvas.toDataURL('image/svg+xml')
  }

  // SSR 环境使用 node-canvas（需安装）
  const canvas = createCanvas(options.size, options.size)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = options.bgColor
  ctx.fillRect(0, 0, options.size, options.size)
  ctx.font = `${options.size * 0.7}px STZhongsong, SimSun, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, options.size / 2, options.size / 2)
  return canvas.toDataURL()
}
