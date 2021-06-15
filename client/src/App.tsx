import React, { FormEvent, ReactComponentElement, useState } from 'react';
import './App.css';
import CanvasWrapper from './components/CanvasWrapper';
import { useMutation } from '@apollo/client'
import { ASSIGN_USER } from './graphQL'
import NotificationPanel from './components/NotificationPanel'
import StartupForm from './components/StartupForm'

interface User {
  name: string
  color: string
}

interface AppState {
  user: User
}

function App(): ReactComponentElement<any> {
  const [ state, setState ] = useState<AppState>( { user: { color: '', name: '' } } );
  const [ assignUser, { data } ] = useMutation( ASSIGN_USER )

  const submitForm = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    // @ts-ignore
    const value = evt.currentTarget && evt.currentTarget.children && evt.currentTarget.children[0].value;

    if ( !value ) {
      return
    }

    assignUser( { variables: { name: value } } ).then( resp => {
      const data = resp.data.assignUser;
      setState( {
        user: {
          color: data.color,
          name: data.name
        }
      } )
    } ).catch( err => console.log )
  }

  if ( !state.user.name || !state.user.color ) {
    return (<StartupForm submitForm={submitForm}/>);
  }

  return (
    <div className="App">
      <div className="collaboration-wrapper">
        <CanvasWrapper color={state.user.color} user={state.user.name}/>
        <NotificationPanel/>
      </div>
    </div>
  );
}

export default App;
