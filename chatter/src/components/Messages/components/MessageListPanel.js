import React, { memo, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import TypingMessage from './TypingMessage';
import Message from './Message';
import '../styles/_messages.scss';
import initialBottyMessage from '../../../common/constants/initialBottyMessage';
import { MY_USER_ID } from '../../UserList/constants/users';

const BOTTY_USER_ID = 'bot';

const MessageListPanel = memo(forwardRef((props, ref) => {
  const listBottomElemRef = useRef();
  const [botTyping, setBotTyping] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 0,
      user: BOTTY_USER_ID,
      message: initialBottyMessage
    },
  ]);

  useImperativeHandle(ref, () => ({
    addMessage(user, message) {
      setMessages(pre => [...pre, {
        id: pre.length,
        user,
        message,
      }]);
    },
    setTyping(typing) {
      setBotTyping(typing)
    },
  }), []);

  // Scroll to bottom when new messages come in or bot is typing.
  useEffect(() => {
    listBottomElemRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, botTyping]);

  const isLastMessage = (index) => {
    const message = messages[index];
    const nextMessage = messages[index + 1];
    return (!nextMessage && (!botTyping || message.user === MY_USER_ID))
      || (nextMessage && nextMessage.user !== message.user);
  }

  return (
    <div className="messages__list" id="message-list" >
      {messages.map((m, i) => <Message
        key={m.id}
        message={m}
        isLast={isLastMessage(i)}
      />)}
      {botTyping && <TypingMessage />}

      {/* Add below empty element for scrolling to bottom */}
      <div id="messages-list-bottom" ref={listBottomElemRef} />
    </div>
  );
}))

export default MessageListPanel;
