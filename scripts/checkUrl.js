import fetch from 'node-fetch';

async function check() {
  const url = 'https://s31.aconvert.com/convert/p3r68-cdx67/ywpyz-4wp42.mp3';
  try {
    const res = await fetch(url);
    console.log('Status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    const buffer = await res.arrayBuffer();
    console.log('Tamaño en bytes:', buffer.byteLength);
  } catch (e) {
    console.error('Error haciendo fetch:', e.message);
  }
}

check();
