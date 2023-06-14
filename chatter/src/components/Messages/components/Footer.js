import React, { useRef, useState } from 'react';

const RETURN_KEY_CODE = 13;

const Footer = React.memo(({ sendMessage }) => {
  const inputElemRef = useRef();
  const [canSend, setCanSend] = useState(false);

  const onKeyDown = ({ keyCode }) => {
    if (keyCode !== RETURN_KEY_CODE) { return; }

    handleSendMessage();
  }

  const handleSendMessage = () => {
    const message = inputElemRef.current?.value;
    if (message) {
      sendMessage(message);
      inputElemRef.current.value = '';
      setCanSend(false);
    }
  }

  const onChangeMessage = (e) => {
    setCanSend(!!e.target.value);
  }

  return (
    <div className="messages__footer">
      <input
        ref={inputElemRef}
        onKeyDown={onKeyDown}
        placeholder="Write a message..."
        id="user-message-input"
        onChange={onChangeMessage}
      />
      <div className="messages__footer__actions">
        <i className="far fa-smile" />
        <i className="fas fa-paperclip" />
        <i className="mdi mdi-ticket-outline" />
        <button onClick={handleSendMessage} disabled={!canSend}>Send</button>
      </div>
    </div>
  );
})

export default Footer;