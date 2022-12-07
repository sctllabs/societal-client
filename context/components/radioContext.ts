import { ChangeEvent } from 'react';

import { createContext } from 'react';

export type RadioContextType = {
  state: string;
  name?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export const RadioContext = createContext<RadioContextType | undefined>(
  undefined
);
