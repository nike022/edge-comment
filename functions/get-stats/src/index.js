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

      const totalComments = commentIds.length;
      let totalLikes = 0;
      let mostLikedComment = null;
      let maxLikes = 0;

      // Fetch up to 7 comments to calculate stats (EdgeKV limit)
      const limit = Math.min(commentIds.length, 7);
      for (let i = 0; i < limit; i++) {
        try {
          const commentData = await edgeKv.get(commentIds[i], { type: 'text' });
          if (commentData) {
            const comment = JSON.parse(commentData);
            const likes = comment.likes || 0;
            totalLikes += likes;

            if (likes > maxLikes) {
              maxLikes = likes;
              mostLikedComment = {
                id: comment.id,
                author: comment.author,
                content: comment.content.substring(0, 50) + (comment.content.length > 50 ? '...' : ''),
                likes: likes
              };
            }
          }
        } catch (error) {
          console.error(`Failed to process comment ${commentIds[i]}:`, error.message);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        stats: {
          totalComments,
          totalLikes,
          mostLikedComment
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });

    } catch (error) {
      console.error('Get stats error:', error.message, error.stack);
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
