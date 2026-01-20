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
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const sort = url.searchParams.get('sort') || 'newest';
      const pageSize = 7; // EdgeKV operation limit: 1 for comments_list + 7 for individual comments = 8 total

      const edgeKv = new EdgeKV({ namespace: 'edge-comment' });

      let commentIds = [];
      const listData = await edgeKv.get('comments_list', { type: 'text' });
      if (listData) {
        commentIds = JSON.parse(listData);
      }

      // Sort commentIds based on sort parameter
      if (sort === 'oldest') {
        commentIds = commentIds.reverse();
      }

      const totalComments = commentIds.length;
      const totalPages = Math.ceil(totalComments / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalComments);

      const comments = [];
      for (let i = startIndex; i < endIndex; i++) {
        let commentData;
        try {
          commentData = await edgeKv.get(commentIds[i], { type: 'text' });
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

      // Sort by likes if requested
      if (sort === 'mostLiked') {
        comments.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      }

      return new Response(JSON.stringify({
        success: true,
        comments,
        pagination: {
          page,
          pageSize,
          totalComments,
          totalPages
        }
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
