import { useEffect, useRef, useState } from 'react';

export interface RealtimeEvent {
  type: 'CONNECTED' | 'CHILD_PAIRED' | 'RISK_ALERT' | 'DEVICE_HEARTBEAT' | 'DEVICE_DISCONNECTED' | 'ALL_DEVICES_DISCONNECTED';
  data: any;
}

interface UseParentRealtimeProps {
  parentId?: string;
  onChildPaired?: (data: { child_id: string; child_name: string; device_name: string }) => void;
  onRiskAlert?: (data: {
    child_id: string;
    child_name: string;
    risk_level: string;
    risk_score: number;
    primary_concern: string;
    title: string;
    message: string;
  }) => void;
  onRefreshNeeded?: () => void;
}

export function useParentRealtime({
  parentId,
  onChildPaired,
  onRiskAlert,
  onRefreshNeeded,
}: UseParentRealtimeProps) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latestToast, setLatestToast] = useState<{
    id: string;
    type: 'info' | 'warning' | 'critical' | 'success';
    title: string;
    message: string;
  } | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!parentId) return;

    const url = `/api/realtime/stream?parent_id=${encodeURIComponent(parentId)}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
    };

    es.onmessage = (event) => {
      try {
        const payload: RealtimeEvent = JSON.parse(event.data);
        if (payload.type === 'CHILD_PAIRED') {
          setLatestToast({
            id: `paired_${Date.now()}`,
            type: 'success',
            title: '🎉 Child Device Activated!',
            message: `${payload.data.child_name}'s device (${payload.data.device_name || 'Mobile'}) is now paired and protected.`,
          });
          onChildPaired?.(payload.data);
          onRefreshNeeded?.();
        } else if (payload.type === 'RISK_ALERT') {
          const isCrit = payload.data.risk_level === 'CRITICAL' || payload.data.risk_score >= 80;
          setLatestToast({
            id: `risk_${Date.now()}`,
            type: isCrit ? 'critical' : 'warning',
            title: payload.data.title || `⚠️ Safety Alert (${payload.data.child_name})`,
            message: payload.data.message || `Risk detected: ${payload.data.primary_concern}`,
          });
          onRiskAlert?.(payload.data);
          onRefreshNeeded?.();
        } else if (payload.type === 'DEVICE_DISCONNECTED' || payload.type === 'ALL_DEVICES_DISCONNECTED') {
          setLatestToast({
            id: `disc_${Date.now()}`,
            type: 'info',
            title: 'Device Mesh Updated',
            message: payload.data.message || 'Child device connection state updated.',
          });
          onRefreshNeeded?.();
        }
      } catch (err) {
        console.warn('Realtime event parse error:', err);
      }
    };

    es.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [parentId, onChildPaired, onRiskAlert, onRefreshNeeded]);

  const dismissToast = () => setLatestToast(null);

  return { isConnected, latestToast, dismissToast };
}
