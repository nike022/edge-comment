export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const edgeKv = new EdgeKV({ namespace: 'edge-comment' });

      let commentIds = [];
      const listData = await edgeKv.get('comments_list', { type: 'text' });
      if (listData) {
        commentIds = JSON.parse(listData);
      }

      const comments = [];
      const limit = 50;
      for (let i = 0; i < Math.min(commentIds.length, limit); i++) {
        try {
          const commentData = await edgeKv.get(commentIds[i], { type: 'text' });
          if (commentData) {
            const comment = JSON.parse(commentData);
            comments.push(comment);
          } else {
            console.error(`Comment ${commentIds[i]} returned empty data`);
          }
        } catch (parseError) {
          console.error(`Failed to parse comment ${commentIds[i]}:`, parseError.message, 'Raw data:', commentData?.substring(0, 100));
          // 跳过无法解析的评论，继续处理其他评论
        }
      }

      return new Response(JSON.stringify({
        success: true,
        comments
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });

    } catch (error) {
      console.error('Get comments error:', error.message, error.stack);
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
