import { useEffect, useState } from 'react';

const SECOND = 1000;

function leadingZero(value: number) {
  return `0${value}`.slice(-2);
}

function formatCountdown(countDown: number, returnArray: boolean) {
  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  const timeArray = [days, hours, minutes, seconds];

  if (returnArray) {
    return timeArray.map((x) => leadingZero(x));
  }

  return timeArray
    .filter((x) => x >= 0)
    .map((x) => leadingZero(x))
    .join(':');
}

export function useCountdown(value: number, returnArray: boolean) {
  const [state, setState] = useState(value);

  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => prev - SECOND);
    }, SECOND);

    return () => clearInterval(interval);
  }, []);

  return formatCountdown(state, returnArray);
}
