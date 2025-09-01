import { createCanvas } from "canvas";

// 动态生成 SVG 字符串（兼容浏览器环境）
export const generateHanziSVG = (
  text: string,
  options = {
    size: 32,
    bgColor: "#000",
    textColor: "white",
    borderRadius: 5, // 新增圆角半径参数
  }
) => {
  // 浏览器环境使用 DOM（构建时自动降级）
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = options.size;
    canvas.height = options.size;
    const ctx = canvas.getContext("2d")!;

    // 绘制圆角背景
    if (ctx.roundRect) {
      // 现代浏览器支持
      ctx.beginPath();
      ctx.roundRect(0, 0, options.size, options.size, options.borderRadius);
      ctx.fillStyle = options.bgColor;
      ctx.fill();
    } else {
      // 兼容旧浏览器
      drawRoundedRect(
        ctx,
        0,
        0,
        options.size,
        options.size,
        options.borderRadius,
        options.bgColor
      );
    }

    // 绘制文字（居中）
    ctx.font = `${options.size * 0.8}px "STZhongsong", "SimSun", serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = options.textColor;
    ctx.fillText(text, options.size / 2, options.size / 2);

    return canvas.toDataURL("image/svg+xml");
  }

  // SSR 环境使用 node-canvas（需安装）
  const canvas = createCanvas(options.size, options.size);
  const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;

  // 绘制圆角背景
  drawRoundedRect(
    ctx,
    0,
    0,
    options.size,
    options.size,
    options.borderRadius,
    options.bgColor
  );

  ctx.font = `${options.size * 0.8}px "STZhongsong", "SimSun", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, options.size / 2, options.size / 2);
  return canvas.toDataURL();
};

// 辅助函数：绘制圆角矩形
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillColor: string
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
}
