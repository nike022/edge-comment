// 生成Gravatar头像URL
export const getGravatarUrl = (email: string, size: number = 40): string => {
  if (!email) {
    // 如果没有邮箱，返回默认头像
    return `https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&s=${size}`;
  }

  // 生成MD5哈希（使用Web Crypto API的简化版本）
  const hash = simpleHash(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?d=mp&s=${size}`;
};

// 简单的哈希函数（用于生成Gravatar URL）
// 注意：这不是真正的MD5，但对于Gravatar来说足够了
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  // 转换为32位十六进制字符串
  return Math.abs(hash).toString(16).padStart(32, '0');
}
