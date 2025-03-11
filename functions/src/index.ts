import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin
initializeApp();

// Example function (you can remove this if not needed)
export const hello = onRequest(
  { 
    memory: '1GiB',
    region: ['us-central1']
  }, 
  async (req, res) => {
    res.send('Hello from Firebase Functions!');
  }
); 