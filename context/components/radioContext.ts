import { ChangeEventHandler, createContext } from 'react';

export type RadioContextType = {
  state: string;
  name?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export const RadioContext = createContext<RadioContextType | undefined>(
  undefined
);
