import { useState } from 'react'
import useOnlineStatus from './hooks/useOnlineStatus'
import Offline from './components/Offline'
import InstallPrompt from './components/InstallPrompt'

function App() {
  const isOnline = useOnlineStatus()

  return (
      <div className="App">

      {/*
      {!isOnline && ( #shorthand for if (!isOnline) { return... } 
        <div style={{
          position: 'fixed',
          top: 0,
          width: '100%',
          backgroundColor: '#ec9494',
          color: 'white',
          padding: '10px',
          textAlign: 'center',
          zIndex: 1000
        }}>
          ⚠️ You are currently offline
        </div>
      )} */}
      
      {!isOnline ? ( /* condition ? valueIfTrue : valueIfFalse */
        <Offline />
      ) : (
        <>
          <h1>My First PWA</h1>
          <p>You're online! All features are available.</p>
          {/* Add the rest of your app content here */}
        </>
      )}

      <InstallPrompt />

    </div>
  );
}

export default App;