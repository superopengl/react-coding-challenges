import React, { memo, useCallback, useContext, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import useSound from 'use-sound';
import config from '../../../config';
import LatestMessagesContext from '../../../contexts/LatestMessages/LatestMessages';
import Header from './Header';
import Footer from './Footer';
import '../styles/_messages.scss';
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

const Messages = memo(() => {
  const [playSend] = useSound(config.SEND_AUDIO_URL);
  const [playReceive] = useSound(config.RECEIVE_AUDIO_URL);
  const { setLatestMessage } = useContext(LatestMessagesContext);
  const messageListPanelRef = useRef()

  // Listen to websocket bot-message event
  useEffect(() => {
    const botMessageHandler = (message) => {
      messageListPanelRef.current?.setTyping(false);
      addMessageToList(BOTTY_USER_ID, message);
      setLatestMessage(BOTTY_USER_ID, message);
      playReceive();
    };

    socket.on(BOTTY_EVENTS.BOT_MESSAGE, botMessageHandler);

    return () => socket.removeListener(BOTTY_EVENTS.BOT_MESSAGE, botMessageHandler);
  }, []);

  // Listen to websocket bot-message event
  useEffect(() => {
    const botTypingHandler = () => {
      messageListPanelRef.current?.setTyping(true);
    }

    socket.on(BOTTY_EVENTS.BOT_TYPING, botTypingHandler);

    return () => socket.removeListener(BOTTY_EVENTS.BOT_TYPING, botTypingHandler);
  }, []);

  console.log('Socket rendering')

  const addMessageToList = (user, message) => {
    messageListPanelRef.current?.addMessage(user, message);
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
      <MessageListPanel ref={messageListPanelRef} />
      <Footer sendMessage={sendMessage} />
    </div>
  );
})

export default Messages;
