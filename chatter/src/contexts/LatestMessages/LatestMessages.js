import React, { createContext, useCallback, useRef } from 'react';
import initialMessages from './constants/initialMessages';
import { BehaviorSubject } from 'rxjs';

const LatestMessagesContext = createContext({});

export default LatestMessagesContext;

export function LatestMessages({ children }) {
  // Convert useState to useRef+Observable is to avoid unnecessary child components rerendering when context changes.
  const messagesRef = useRef(new BehaviorSubject(initialMessages));

  const setLatestMessage = useCallback((userId, value) => {
    const subject = messagesRef.current;
    const messages = subject.getValue();

    // Publish global latest messages change
    subject.next({ ...messages, [userId]: value });
  }, []);

  return (
    <LatestMessagesContext.Provider value={{lastMessageSource$: messagesRef.current, setLatestMessage}}>
      {children}
    </LatestMessagesContext.Provider>
  );
}
