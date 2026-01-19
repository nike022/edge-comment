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

      const edgeKv = new EdgeKV({ namespace: 'edge-comment' });
      const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const comment = {
        id: commentId,
        author,
        email: email || '',
        content,
        timestamp: new Date().toISOString(),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      };

      await edgeKv.put(commentId, JSON.stringify(comment));

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
