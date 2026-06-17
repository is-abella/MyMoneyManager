import { useState, useEffect } from 'react';

function useOnlineStatus() {
  // isOnline stores the value and setIsOnline is a function that can be used to change the value. 
  //navigator.onLine is the initial state of the online status, which is true if the browser is online and false if it's offline.
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true); // now state is set to true when user is online
      console.log('Internet connection restored!');
    }
    
    function handleOffline() {
      setIsOnline(false);
      console.log('Internet connection lost.');
    }
    
    // Register event listeners
    // These functions execute when browser detects online/offline status changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Remove event listeners when component unmounts
    // This is essential to prevent memory leaks
    return () => { //for UseEffect, the function returned is called when the component unmounts
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // Empty array: execute ONCE when component mounts so it doesn't keep firing event listeners on every render
  
  return isOnline;
}

export default useOnlineStatus;


//Notes
//<button onClick={handleClick(i)}> CALLS the function immediately when the component renders, 
//which is not what we want. We want to PASS a reference

//<button onClick={() => handleClick(i)}> creates a new function that calls 
// handleClick(i) when the button is clicked, which is correct

// default in export default means that it is the main/top-level component.

//In JavaScript, functions are "first-class objects", which means you can:
//store them in variables, pass them as arguments, return them from other functions

// props are information a parent component gives to a child component. 
// Event handler props usually named onSomething, e.g. onClick

// event handlers are functions that are called when a specific event occurs, usually have handle in their name
// e.g. function handleClick() being passed to  <button onClick={handleClick}> 

// useEffect is run after the component renders. 
