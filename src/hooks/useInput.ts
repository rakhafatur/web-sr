import { useState } from 'react';

export function useInput(initialValue: string) {
  const [value, setValue] = useState(initialValue);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return {
    value,
    onChange,
    reset: () => setValue(''),
    bind: {
      value,
      onChange,
    },
  };
}