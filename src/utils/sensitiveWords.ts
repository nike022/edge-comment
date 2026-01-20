// 敏感词列表（示例，实际使用时应该更完善）
const SENSITIVE_WORDS = [
  '垃圾', '傻逼', '操', '妈的', '草泥马',
  '政治敏感词1', '政治敏感词2', // 根据实际需求添加
];

// 检查内容是否包含敏感词
export const containsSensitiveWords = (content: string): boolean => {
  const lowerContent = content.toLowerCase();
  return SENSITIVE_WORDS.some(word => lowerContent.includes(word.toLowerCase()));
};

// 过滤敏感词（替换为星号）
export const filterSensitiveWords = (content: string): string => {
  let filtered = content;
  SENSITIVE_WORDS.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  });
  return filtered;
};
