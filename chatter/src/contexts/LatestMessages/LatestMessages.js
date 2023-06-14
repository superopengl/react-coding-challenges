import React, { useState, createContext, useCallback, useMemo } from 'react';
import initialMessages from './constants/initialMessages';

const LatestMessagesContext = createContext({});

export default LatestMessagesContext;

export function LatestMessages({ children }) {
  const [messages, setMessages] = useState(initialMessages);

  const setLatestMessage = useCallback((userId, value) => {
    setMessages({ ...messages, [userId]: value });
  }, []);

  const contextValue = useMemo(() => ({
    messages,
    setLatestMessage,
  }), [messages]);

  return (
    <LatestMessagesContext.Provider value={contextValue}>
      {children}
    </LatestMessagesContext.Provider>
  );
}
