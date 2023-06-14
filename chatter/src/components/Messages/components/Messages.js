import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
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
const MY_USER_ID = 'me';

function Messages() {
  const [playSend] = useSound(config.SEND_AUDIO_URL);
  const [playReceive] = useSound(config.RECEIVE_AUDIO_URL);
  const { setLatestMessage } = useContext(LatestMessagesContext);
  const listBottomElemRef = useRef();
  const [currentMessage, setCurrentMessage] = useState('')
  const [botTyping, setBotTyping] = useState(false)
  const [messages, setMessages] = useState([
    {
      user: BOTTY_USER_ID,
      message: initialBottyMessage
    },
  ]);

  // Listen to websocket bot-message event
  useEffect(() => {
    const botMessageHandler = (message) => {
      appendMessageToList(BOTTY_USER_ID, message);
      setLatestMessage(BOTTY_USER_ID, message);
      setBotTyping(false);
      playReceive();
    };
    socket.on(BOTTY_EVENTS.BOT_MESSAGE, botMessageHandler);

    return () => socket.removeListener(BOTTY_EVENTS.BOT_MESSAGE, botMessageHandler);
  }, []);

  // Listen to websocket bot-message event
  useEffect(() => {
    const botTypingHandler = () => {
      setBotTyping(true);
    }
    socket.on(BOTTY_EVENTS.BOT_TYPING, botTypingHandler);

    return () => socket.removeListener(BOTTY_EVENTS.BOT_TYPING, botTypingHandler);
  }, []);

  // Scroll to bottom when new messages come in or bot is typing.
  useEffect(() => {
    listBottomElemRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, botTyping]);

  const appendMessageToList = (user, message) => {
    setMessages(pre => [...pre, { user, message }])
  }

  const sendMessage = () => {
    socket.emit(BOTTY_EVENTS.USER_MESSAGE, currentMessage);
    appendMessageToList(MY_USER_ID, currentMessage);
    setCurrentMessage('');
    playSend();
  };

  const onChangeMessage = (e) => {
    setCurrentMessage(e.target.value);
  };

  return (
    <div className="messages">
      <Header />
      <div className="messages__list" id="message-list" >
        {messages.map((m, i) => <Message
          key={i}
          message={{ ...m, id: i }}
          nextMessage={messages[i + 1]}
          botTyping={botTyping}
        />)}
        {botTyping && <TypingMessage />}
        
        {/* Add below empty element for scrolling to bottom */}
        <div id="messages-list-bottom" ref={listBottomElemRef} /> 
      </div>
      <Footer message={currentMessage} sendMessage={sendMessage} onChangeMessage={onChangeMessage} />
    </div>
  );
}

export default Messages;
