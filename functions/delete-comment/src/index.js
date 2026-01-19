export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    if (request.method !== 'DELETE') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Unauthorized'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const token = authHeader.substring(7);
      const [headerB64, payloadB64, signatureB64] = token.split('.');

      if (!headerB64 || !payloadB64 || !signatureB64) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid token'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const edgeKv = new EdgeKV({ namespace: 'edge-comment' });
      const jwtSecret = await edgeKv.get('jwt_secret', { type: 'text' });

      if (!jwtSecret) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Server configuration error'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(jwtSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );

      const signatureInput = `${headerB64}.${payloadB64}`;
      const signatureBytes = Uint8Array.from(
        atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/').padEnd(signatureB64.length + (4 - signatureB64.length % 4) % 4, '=')),
        c => c.charCodeAt(0)
      );

      const isValid = await crypto.subtle.verify(
        'HMAC',
        key,
        signatureBytes,
        new TextEncoder().encode(signatureInput)
      );

      if (!isValid) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid token'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const payload = JSON.parse(atob(payloadB64));
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Token expired'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const url = new URL(request.url);
      const commentId = url.searchParams.get('commentId');

      if (!commentId) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Missing commentId parameter'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      await edgeKv.delete(commentId);

      const maxRetries = 3;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          let comments = [];
          const existingData = await edgeKv.get('comments_list', { type: 'text' });
          if (existingData) {
            comments = JSON.parse(existingData);
          }
          comments = comments.filter(id => id !== commentId);
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
        success: true
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
