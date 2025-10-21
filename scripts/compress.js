import fs from "fs";
import path from "path";
import sharp from "sharp";

// 控制台颜色常量
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",

  // 字体颜色
  fg: {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    gray: "\x1b[90m",
  },

  // 背景颜色
  bg: {
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m",
  },
};

// 彩色日志函数
function logColor(text, color = colors.fg.white) {
  console.log(`${color}${text}${colors.reset}`);
}

function logError(text) {
  console.error(`${colors.fg.red}${text}${colors.reset}`);
}

function logSuccess(text) {
  console.log(`${colors.fg.green}${text}${colors.reset}`);
}

function logInfo(text) {
  console.log(`${colors.fg.blue}${text}${colors.reset}`);
}

function logWarning(text) {
  console.log(`${colors.fg.yellow}${text}${colors.reset}`);
}

/**
 * 压缩指定目录下的图片文件
 * @param directory 图片所在目录
 * @param quality 压缩质量 (0-100)
 * @param convertToWebp 是否转换为WebP格式
 */
async function compressImages(directory, quality = 85, convertToWebp = false) {
  try {
    // 检查目录是否存在
    if (!fs.existsSync(directory)) {
      logError(`目录不存在: ${directory}`);
      return;
    }

    // 读取目录内容
    const files = fs.readdirSync(directory);

    // 过滤出以 image 开头的图片文件
    const imageFiles = files.filter((file) => {
      const isImage = /^image-.*\.(jpg|jpeg|png|webp)$/i.test(file);
      return isImage;
    });

    logInfo(`找到 ${imageFiles.length} 个需要压缩的图片文件`);

    // 逐个压缩图片
    for (let index = 0; index < imageFiles.length; index++) {
      const file = imageFiles[index];
      const progress = Math.round(((index + 1) / imageFiles.length) * 100);

      // 显示进度条
      const progressBar = `[${"=".repeat(Math.round(progress / 5))}${" ".repeat(20 - Math.round(progress / 5))}]`;
      process.stdout.write(
        `\r${colors.fg.cyan}进度: ${progressBar} ${progress}% (${index + 1}/${imageFiles.length})${colors.reset}`
      );
      const filePath = path.join(directory, file);
      const fileExtension = path.extname(file).toLowerCase();

      try {
        // 获取原始文件大小
        const originalSize = fs.statSync(filePath).size;

        // 根据文件类型选择不同的压缩配置
        let compressedImage;

        // 如果启用了WebP转换，无论原始格式如何，都使用WebP编码器
        if (convertToWebp && fileExtension !== ".webp") {
          compressedImage = sharp(filePath).webp({
            quality,
            smartSubsample: true,
            effort: 6, // 压缩努力程度 0-6，6 提供更好的压缩
          });
        } else {
          // 否则根据原始文件类型使用相应的编码器
          switch (fileExtension) {
            case ".jpg":
            case ".jpeg":
              compressedImage = sharp(filePath).jpeg({
                quality,
                progressive: true, // 启用渐进式JPEG
                trellisQuantisation: true,
                overshootDeringing: true,
                optimiseScans: true,
              });
              break;
            case ".png":
              compressedImage = sharp(filePath).png({
                quality,
                compressionLevel: 6, // 压缩级别 0-9，6 是一个很好的平衡点
                adaptiveFiltering: true,
                force: true,
              });
              break;
            case ".webp":
              compressedImage = sharp(filePath).webp({
                quality,
                smartSubsample: true,
                effort: 6, // 压缩努力程度 0-6，6 提供更好的压缩
              });
              break;
            default:
              logWarning(`跳过不支持的文件类型: ${file}`);
              continue;
          }
        }

        // 确定输出文件路径
        let outputPath;
        if (convertToWebp) {
          // 转换为webp格式，更改扩展名
          const baseName = path.basename(filePath, path.extname(filePath));
          outputPath = path.join(directory, `${baseName}.webp`);
        } else {
          // 使用临时文件避免输入输出文件相同的错误
          outputPath = path.join(directory, `temp_${file}`);
        }

        // 如果是webp转换且文件已经是webp格式，则跳过
        if (convertToWebp && fileExtension === ".webp") {
          logWarning(`跳过已转换为WebP格式的文件: ${file}`);
          continue;
        }

        // 保存压缩后的图片
        await compressedImage.toFile(outputPath);

        // 获取压缩后的文件大小
        const compressedSize = fs.statSync(outputPath).size;

        if (convertToWebp) {
          // 如果是webp转换，删除原文件
          // 不在这里打印，而是在压缩完成后一起打印
          fs.unlinkSync(filePath);
        } else {
          // 如果是常规压缩，替换原文件
          fs.unlinkSync(filePath);
          fs.renameSync(outputPath, filePath);
        }

        // 计算压缩率
        const reduction = (
          ((originalSize - compressedSize) / originalSize) *
          100
        ).toFixed(2);

        // 压缩成功后的详细信息（不换行，等待进度条更新）
        const details = convertToWebp
          ? `${file} -> ${path.basename(outputPath)}: ${formatBytes(originalSize)} -> ${formatBytes(compressedSize)} (减少 ${reduction}%)`
          : `${file}: ${formatBytes(originalSize)} -> ${formatBytes(compressedSize)} (减少 ${reduction}%)`;

        // 压缩率为正，显示成功信息（绿色）
        if (parseFloat(reduction) > 0) {
          console.log(`\n${colors.fg.green}✓ ${details}${colors.reset}`);
        } else {
          console.log(`\n${colors.fg.yellow}⚠ ${details}${colors.reset}`);
        }
      } catch (error) {
        console.log(""); // 确保错误信息在新行显示
        logError(`压缩文件失败: ${file}`);
        logError(error.message);
      }
    }

    // 确保进度条完成
    console.log("");
    logSuccess("图片压缩完成！");
  } catch (error) {
    console.log(""); // 确保错误信息在新行显示
    logError("压缩过程中发生错误:", error.message);
  }
}

/**
 * 格式化字节数为可读格式
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// 主函数
async function main() {
  // 获取命令行参数，默认为当前工作目录
  // 第一个参数是 node 路径，第二个参数是脚本路径，第三个参数开始是自定义参数
  const args = process.argv.slice(2);

  // 解析命令行参数
  let targetDirectory = "."; // 默认当前目录
  let quality = 85; // 默认质量
  let convertToWebp = false; // 是否转换为webp格式

  // 处理参数
  let dirSet = false;
  let qualitySet = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--webp") {
      // 开启webp转换
      convertToWebp = true;
    } else if (!arg.startsWith("--")) {
      // 非选项参数
      if (!dirSet) {
        // 第一个非选项参数被视为目录
        targetDirectory = arg;
        dirSet = true;
      } else if (!qualitySet) {
        // 第二个非选项参数被视为质量
        quality = parseInt(arg, 10);
        qualitySet = true;
      }
    }
  }

  // 确保路径是绝对路径
  if (!path.isAbsolute(targetDirectory)) {
    targetDirectory = path.resolve(targetDirectory);
  }

  // 验证质量参数是否有效
  if (isNaN(quality) || quality < 0 || quality > 100) {
    logError("质量参数必须是 0-100 之间的数字");
    return;
  }

  logInfo(`开始压缩目录: ${targetDirectory}`);
  logInfo(`使用压缩质量: ${quality}`);
  if (convertToWebp) {
    logInfo("图片将转换为WebP格式");
  }

  // 调用压缩函数
  await compressImages(targetDirectory, quality, convertToWebp);
}

// 执行主函数
main().catch(console.error);
