export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { message, signature, publicKey } = req.body;

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    const keyBuffer = Uint8Array.from(atob(publicKey), c => c.charCodeAt(0));
    const importedKey = await crypto.subtle.importKey(
      'spki',
      keyBuffer,
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      true,
      ['verify']
    );

    const sigBuffer = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    const verified = await crypto.subtle.verify(
      {
        name: 'ECDSA',
        hash: { name: 'SHA-256' },
      },
      importedKey,
      sigBuffer,
      data
    );

    res.status(200).json({
      verified,
      message: verified ? 'Identity verified successfully' : 'Verification failed',
    });
  }
  catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

