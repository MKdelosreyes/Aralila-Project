'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';

export default function TestPage() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('test/')
      .then((res) => setMessage(res.data.message))
      .catch((err) => console.error('API Error:', err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Test API</h1>
      <p className="mt-4">{message || 'Loading...'}</p>
    </div>
  );
}
