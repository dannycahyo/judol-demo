import { useEffect, useState } from 'react';

export default function TestSSE() {
  const [events, setEvents] = useState<
    { timestamp: string; data: unknown }[]
  >([]);
  const [connectionStatus, setConnectionStatus] =
    useState('Disconnected');

  useEffect(() => {
    console.log('🧪 Test SSE component mounted');

    const eventSource = new EventSource('/api/game-events');

    eventSource.onopen = () => {
      console.log('🔄 SSE connection opened');
      setConnectionStatus('Connected');
    };

    eventSource.onmessage = (event) => {
      console.log('📥 SSE message received:', event.data);

      try {
        const data = JSON.parse(event.data);
        setEvents((prev) => [
          ...prev,
          {
            timestamp: new Date().toISOString(),
            data: data,
          },
        ]);
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      setConnectionStatus('Error');
    };

    return () => {
      eventSource.close();
      setConnectionStatus('Disconnected');
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>SSE Test Page</h1>
      <div>
        <strong>Connection Status: </strong>
        <span
          style={{
            color:
              connectionStatus === 'Connected'
                ? 'green'
                : connectionStatus === 'Error'
                ? 'red'
                : 'orange',
          }}
        >
          {connectionStatus}
        </span>
      </div>

      <h2>Received Events ({events.length})</h2>
      <div
        style={{
          maxHeight: '400px',
          overflow: 'auto',
          border: '1px solid #ccc',
          padding: '10px',
        }}
      >
        {events.length === 0 ? (
          <p>No events received yet...</p>
        ) : (
          events.map((event, index) => (
            <div
              key={index}
              style={{
                marginBottom: '10px',
                padding: '5px',
                border: '1px solid #eee',
              }}
            >
              <div>
                <strong>Time:</strong> {event.timestamp}
              </div>
              <div>
                <strong>Data:</strong>{' '}
                {JSON.stringify(event.data, null, 2)}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={() => setEvents([])}>Clear Events</button>
      </div>
    </div>
  );
}
