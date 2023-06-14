import React from 'react';
import cx from 'classnames';
import { MY_USER_ID } from '../../UserList/constants/users';

const Message = React.memo(({ message, isLast }) => {
  return (
    <p
      className={cx(
        'messages__message',
        'animate__animated animate__rubberBand',
        {
          'messages__message--me': message.user === MY_USER_ID,
          'messages__message--last': isLast
        }
      )}
      key={message.id}
    >
      {message.message}
    </p>
  );
})

export default Message
