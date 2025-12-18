"use client";

import { useState, useEffect } from 'react';
import { AnalyticsDashboard } from '@/types/PerformanceAnalytics';
import { env } from '@/lib/env';

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No access token found');
      }

      // const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
      const response = await fetch(
        `${env.backendUrl}/api/progress/analytics/dashboard/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const analyticsData = await response.json();
      setData(analyticsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchAnalytics };
}