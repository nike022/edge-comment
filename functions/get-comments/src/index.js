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
        const commentData = await edgeKv.get(commentIds[i], { type: 'text' });
        if (commentData) {
          comments.push(JSON.parse(commentData));
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
