export function printCentered(text) {
  const terminalWidth = process.stdout.columns; // 获取终端的宽度
  const textWidth = text.length; // 获取文本的宽度
  const padding = Math.floor((terminalWidth - textWidth) / 2); // 计算左侧填充的空格数
  // 构建居中的文本
  const centeredText = " ".repeat(padding) + text + " ".repeat(padding);
  // 打印居中文本
  console.log(centeredText);
}
