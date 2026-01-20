export default {
  async fetch(request) {
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

      const results = [];
      for (let i = 0; i < commentIds.length; i++) {
        const commentId = commentIds[i];
        try {
          const commentData = await edgeKv.get(commentId, { type: 'text' });
          if (!commentData) {
            results.push({
              id: commentId,
              status: 'empty',
              error: 'No data returned'
            });
            continue;
          }

          try {
            const comment = JSON.parse(commentData);
            results.push({
              id: commentId,
              status: 'ok',
              hasLikes: comment.likes > 0,
              likes: comment.likes || 0,
              author: comment.author
            });
          } catch (parseError) {
            results.push({
              id: commentId,
              status: 'corrupted',
              error: parseError.message,
              rawData: commentData.substring(0, 200)
            });
          }
        } catch (error) {
          results.push({
            id: commentId,
            status: 'error',
            error: error.message
          });
        }
      }

      const summary = {
        total: commentIds.length,
        ok: results.filter(r => r.status === 'ok').length,
        corrupted: results.filter(r => r.status === 'corrupted').length,
        empty: results.filter(r => r.status === 'empty').length,
        error: results.filter(r => r.status === 'error').length
      };

      return new Response(JSON.stringify({
        success: true,
        summary,
        results
      }, null, 2), {
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
