import React, { ForwardedRef, ReactComponentElement, useEffect, useState } from 'react';
import PropTypes from 'prop-types'
import { useSubscription } from '@apollo/client'
import { ON_MARKUPS_ADDED, ON_USER_ADDED } from '../graphQL'



const NotificationPanel = function () {

  const userSubscriptionData = useSubscription( ON_USER_ADDED )
  const [state, setState] = useState<[]>([])

  useEffect(() => {
    if (!userSubscriptionData.data || !userSubscriptionData.data.onUserJoined) {
      return
    }

    const newState = [...state].concat({...userSubscriptionData.data.onUserJoined}) as []

    setState(newState);
  }, [userSubscriptionData.data])

  return (
    <div className="notification-panel">
      <div className="display-area">
        {state.map((msg: any) => (
          <div className="msg-wrapper">{msg.name} joined using <div className="color-indicator" style={{ backgroundColor: msg.color}}/></div>
        ))}
      </div>
    </div>
  )
}

NotificationPanel.propTypes = {};

NotificationPanel.displayName = 'NotificationPanel';

export default NotificationPanel;
