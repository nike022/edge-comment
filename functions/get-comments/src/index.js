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

      // First, get all valid comments to calculate accurate totals
      const allComments = [];
      for (const commentId of commentIds) {
        try {
          const commentData = await edgeKv.get(commentId, { type: 'text' });
          if (commentData) {
            const comment = JSON.parse(commentData);
            allComments.push(comment);
          }
        } catch (parseError) {
          console.error(`Failed to parse comment ${commentId}:`, parseError.message);
        }
      }

      // Sort comments based on sort parameter
      if (sort === 'oldest') {
        allComments.reverse();
      } else if (sort === 'mostLiked') {
        allComments.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      }

      // Calculate accurate totals based on existing comments
      const totalComments = allComments.length;
      const totalPages = Math.ceil(totalComments / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalComments);

      // Get comments for current page
      const comments = allComments.slice(startIndex, endIndex);

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
