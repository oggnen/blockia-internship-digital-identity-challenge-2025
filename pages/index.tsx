import { useState } from 'react';

export default function Login() {

  const githubID = 'oggnen';
  const firstSixCharsOfID = githubID.slice(0, 6);
  const userName = 'OgnenBoshkovski'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const formattedDate = `${year}${month}${day}`;

    const message = `BLOCKIA-${userName}-${firstSixCharsOfID}-${formattedDate}`;

    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      true,
      ['sign', 'verify']
    );

    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    const signature = await window.crypto.subtle.sign(
      {
        name: 'ECDSA',
        hash: {name: 'SHA-256'},
      },
      keyPair.privateKey,
      data
    );

    const exportedKey = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          signature: btoa(String.fromCharCode(...new Uint8Array(signature))),
          publicKey: btoa(String.fromCharCode(...new Uint8Array(exportedKey))), 
        }),
      });

      console.log("Signed message sample:");
      console.log({
        message,
        signature: btoa(String.fromCharCode(...new Uint8Array(signature))),
        publicKey: btoa(String.fromCharCode(...new Uint8Array(exportedKey))), 
      });

      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage('Something went wrong');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login with your ID</h2>
      <form onSubmit={handleSubmit}>
        <h5>Current ID: {githubID}</h5>
        <hr/>
        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '100px auto',
    padding: '2rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontFamily: 'Arial, sans-serif'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  input: {
    padding: '0.5rem',
    fontSize: '1rem'
  },
  button: {
    padding: '0.5rem',
    fontSize: '1rem',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px'
  }
};

