import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user && token) {
      // Connect to the WebSocket server
      const newSocket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000', {
        auth: {
          token: token,
        },
      });

      newSocket.on('connect', () => {
        console.log('WebSocket connected:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      });

      // --- Notification Listeners ---
      newSocket.on('rfp_published', (data) => {
        toast.info(`New RFP Published: ${data.title}`, {
          description: 'A new RFP is available for you to browse.',
          action: {
            label: 'View',
            onClick: () => (window.location.href = `/rfps/${data.id}`),
          },
        });
      });

      newSocket.on('response_submitted', (data) => {
        toast.success(`New Response Submitted for ${data.rfp.title}`, {
          description: `A new response was submitted by ${data.supplier.email}.`,
          action: {
            label: 'Review',
            onClick: () => (window.location.href = `/responses/${data.id}`),
          },
        });
      });
      
      newSocket.on('rfp_status_changed', (data) => {
         toast.warning(`RFP Status Updated: ${data.rfp.title}`, {
          description: `The status of an RFP you responded to has changed to "${data.newStatus}".`,
          action: {
            label: 'View RFP',
            onClick: () => (window.location.href = `/rfps/${data.rfp.id}`),
          },
        });
      });

      setSocket(newSocket);

      // Clean up the connection when the component unmounts or user logs out
      return () => {
        newSocket.disconnect();
      };
    } else if (socket) {
      // If the user logs out, disconnect the existing socket
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [user, token]);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};
