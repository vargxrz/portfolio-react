import { useEffect, useState } from 'react';
import { ready } from '../lib/boot.js';

let isReady = false;
ready.then(() => { isReady = true; });

/** True once the loader has left the screen. */
const useBootReady = () => {
  const [value, setValue] = useState(isReady);
  useEffect(() => {
    if (isReady) return undefined;
    let alive = true;
    ready.then(() => alive && setValue(true));
    return () => { alive = false; };
  }, []);
  return value;
};

export default useBootReady;
