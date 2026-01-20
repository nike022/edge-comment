export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const data = await request.json();
      const { author, email, content } = data;

      if (!author || !content) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Author and content are required'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      // 内容长度验证
      if (content.length > 500) {
        return new Response(JSON.stringify({
          success: false,
          error: '评论内容不能超过500字'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      // 敏感词过滤
      const sensitiveWords = ['垃圾', '傻逼', '操', '妈的', '草泥马'];
      const containsSensitive = sensitiveWords.some(word =>
        content.toLowerCase().includes(word.toLowerCase())
      );

      if (containsSensitive) {
        return new Response(JSON.stringify({
          success: false,
          error: '评论内容包含敏感词，请修改后重试'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const edgeKv = new EdgeKV({ namespace: 'edge-comment' });
      const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

      // 后端频率限制检查
      const rateLimitKey = `rate_limit_${clientIp}`;
      try {
        const lastSubmitData = await edgeKv.get(rateLimitKey, { type: 'text' });
        if (lastSubmitData) {
          const lastSubmitTime = parseInt(lastSubmitData);
          const timeDiff = Date.now() - lastSubmitTime;
          if (timeDiff < 60000) {
            const waitSeconds = Math.ceil((60000 - timeDiff) / 1000);
            return new Response(JSON.stringify({
              success: false,
              error: `请等待 ${waitSeconds} 秒后再提交`
            }), {
              status: 429,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
          }
        }
      } catch (e) {
        console.log('Rate limit check failed:', e);
      }

      const commentId = `comment_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

      const comment = {
        id: commentId,
        author,
        email: email || '',
        content,
        timestamp: new Date().toISOString(),
        ip: clientIp
      };

      await edgeKv.put(commentId, JSON.stringify(comment));

      // 记录提交时间用于频率限制
      try {
        await edgeKv.put(rateLimitKey, Date.now().toString(), { expirationTtl: 60 });
      } catch (e) {
        console.log('Failed to set rate limit:', e);
      }

      const maxRetries = 3;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          let comments = [];
          const existingData = await edgeKv.get('comments_list', { type: 'text' });
          if (existingData) {
            comments = JSON.parse(existingData);
          }
          comments.unshift(commentId);
          await edgeKv.put('comments_list', JSON.stringify(comments));
          break;
        } catch (e) {
          if (attempt === maxRetries - 1) {
            console.error('Failed to update comments list:', e);
          }
          await new Promise(resolve => setTimeout(resolve, 50 * (attempt + 1)));
        }
      }

      return new Response(JSON.stringify({
        success: true,
        commentId
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });

    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  }
};
