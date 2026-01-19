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
      const { password } = await request.json();

      if (!password) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Password is required'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const edgeKv = new EdgeKV({ namespace: 'edge-comment' });
      const storedHash = await edgeKv.get('admin_password_hash', { type: 'text' });

      if (!storedHash) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Server configuration error'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const passwordBuffer = new TextEncoder().encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (hashHex !== storedHash) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid password'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

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

      const header = { alg: 'HS256', typ: 'JWT' };
      const payload = {
        admin: true,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
      };

      const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(jwtSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signatureInput = `${headerB64}.${payloadB64}`;
      const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(signatureInput)
      );

      const signatureArray = Array.from(new Uint8Array(signature));
      const signatureB64 = btoa(String.fromCharCode(...signatureArray))
        .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

      const token = `${headerB64}.${payloadB64}.${signatureB64}`;

      return new Response(JSON.stringify({
        success: true,
        token
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
