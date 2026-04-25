/** 统计中文字符数（不包含标点、空格、英文） */
export function countChineseChars(text: string): number {
  let count = 0;
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (
      (code >= 0x4e00 && code <= 0x9fff) ||
      (code >= 0x3400 && code <= 0x4dbf)
    ) {
      count++;
    }
  }
  return count;
}

/** 统计总字符数（含中文、英文、数字，不含空格和换行） */
export function countTotalChars(text: string): number {
  return text.replace(/\s/g, '').length;
}

/** 统计英文单词数 */
export function countEnglishWords(text: string): number {
  const englishText = text.replace(/[^\x00-\x7f]/g, ' ').trim();
  if (!englishText) return 0;
  return englishText.split(/\s+/).length;
}

/** 估算网文字数（中文字符 + 英文单词折算） */
export function countWebNovelWords(text: string): number {
  const chinese = countChineseChars(text);
  const english = countEnglishWords(text);
  // 英文每 2 个单词大约等于 1 个中文字符的阅读量
  return chinese + Math.ceil(english / 2);
}
