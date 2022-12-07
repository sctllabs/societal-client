import { useContext } from 'react';

import {
  RadioContext,
  RadioContextType
} from 'context/components/radioContext';

export function useRadioContext(): RadioContextType {
  const context = useContext(RadioContext);

  if (!context) {
    throw new Error(
      'Radio compound components cannot be rendered outside the Radio component'
    );
  }

  return context;
}
