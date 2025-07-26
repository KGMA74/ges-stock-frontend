// hooks/useWebSocket.ts
import { useEffect, useRef } from 'react';

const useWebSocket = (url: string, onMessage: (data: any) => void) => {
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        ws.current = new WebSocket(url);

        ws.current.onmessage = (event) => {
            onMessage(JSON.parse(event.data));
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [url, onMessage]);

    const sendMessage = (message: any) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message));
        }
    };

    return { sendMessage };
};

export default useWebSocket;