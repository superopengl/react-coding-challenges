import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import io from 'socket.io-client';
import useSound from 'use-sound';
import config from '../../../config';
import LatestMessagesContext from '../../../contexts/LatestMessages/LatestMessages';
import TypingMessage from './TypingMessage';
import Header from './Header';
import Footer from './Footer';
import Message from './Message';
import '../styles/_messages.scss';
import initialBottyMessage from '../../../common/constants/initialBottyMessage';
import { MY_USER_ID } from '../../UserList/constants/users';
import MessageListPanel from './MessageListPanel';

const socket = io(
  config.BOT_SERVER_ENDPOINT,
  { transports: ['websocket', 'polling', 'flashsocket'] }
);

const BOTTY_EVENTS = {
  BOT_TYPING: 'bot-typing',
  BOT_MESSAGE: 'bot-message',
  USER_MESSAGE: 'user-message',
}

const BOTTY_USER_ID = 'bot';

function Messages() {
  const [playSend] = useSound(config.SEND_AUDIO_URL);
  const [playReceive] = useSound(config.RECEIVE_AUDIO_URL);
  const { setLatestMessage } = useContext(LatestMessagesContext);
  const messagePanelRef = useRef()

  // Listen to websocket bot-message event
  useEffect(() => {
    const botMessageHandler = (message) => {
      addMessageToList(BOTTY_USER_ID, message);
      setLatestMessage(BOTTY_USER_ID, message);
      playReceive();
      messagePanelRef.current.setTyping(false);
    };
    socket.on(BOTTY_EVENTS.BOT_MESSAGE, botMessageHandler);

    return () => socket.removeListener(BOTTY_EVENTS.BOT_MESSAGE, botMessageHandler);
  }, []);

  // Listen to websocket bot-message event
  useEffect(() => {
    const botTypingHandler = () => {
      messagePanelRef.current.setTyping(true);
    }
    socket.on(BOTTY_EVENTS.BOT_TYPING, botTypingHandler);

    return () => socket.removeListener(BOTTY_EVENTS.BOT_TYPING, botTypingHandler);
  }, []);

  useEffect(() => {
    console.log('Socket rendering')
    debugger;
  })

  const addMessageToList = (user, message) => {
    messagePanelRef.current.addMessage(user, message);
  }

  // Using useCallback to about the Footer from being re-rendered on messages' change
  const sendMessage = useCallback((message) => {
    socket.emit(BOTTY_EVENTS.USER_MESSAGE, message);
    addMessageToList(MY_USER_ID, message);
    playSend();
  }, []);


  return (
    <div className="messages">
      <Header />
      <MessageListPanel ref={messagePanelRef} />
      <Footer sendMessage={sendMessage} />
    </div>
  );
}

export default Messages;
