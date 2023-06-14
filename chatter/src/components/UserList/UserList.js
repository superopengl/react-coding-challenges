import React, { useContext, memo, useState } from 'react';
import cx from 'classnames';
import LatestMessagesContext from '../../contexts/LatestMessages/LatestMessages';
import UserProfile from '../../common/components/UserProfile/UserProfile';
import USERS from './constants/users';
import './_user-list.scss';

const User = memo(({ icon, name, lastActive, isOnline, userId, color }) => {
  const { subject$ } = useContext(LatestMessagesContext);
  const [message, setMessage] = useState();
  
  React.useEffect(() => {
    // Subscribe global latest messages change.
    const sub$ = subject$.subscribe(messages => {
      setMessage(messages[userId])
    })

    return () => sub$.unsubscribe();
  }, []);

  return (
    <div className="user-list__users__user">
      <UserProfile icon={icon} name={name} color={color} />
      <div className="user-list__users__user__right-content">
        <div className="user-list__users__user__title">
          <p>{name}</p>
          <p className={cx({ 'user-list__users__user__online': isOnline })}>
            {isOnline ? 'Online' : lastActive}
          </p>
        </div>
        <p>{message}</p>
      </div>
    </div>
  );
});

const UserList = memo(() => {
  return (
    <div className="user-list">
      <div className="user-list__header">
        <div className="user-list__header__left">
          <p>All Messages</p>
          <i className="fas fa-chevron-down" />
        </div>
        <i className="fas fa-cog" />
      </div>
      <div className="user-list__users">
        {USERS.map(user => <User key={user.name} {...user} />)}
      </div>
    </div>
  );
});

export default UserList;
