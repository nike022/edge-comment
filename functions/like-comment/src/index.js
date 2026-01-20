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
      const { commentId } = data;

      if (!commentId) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Comment ID is required'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const edgeKv = new EdgeKV({ namespace: 'edge-comment' });

      const commentData = await edgeKv.get(commentId, { type: 'text' });
      if (!commentData) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Comment not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const comment = JSON.parse(commentData);
      comment.likes = (comment.likes || 0) + 1;

      await edgeKv.put(commentId, JSON.stringify(comment));

      return new Response(JSON.stringify({
        success: true,
        likes: comment.likes
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
