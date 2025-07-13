import { createContext, useContext, useState, ReactNode } from 'react';

const DnDContext = createContext<[string | null, (type: string | null) => void]>([null, (_: string | null) => {}]);

export const DnDProvider = ({ children }: { children: ReactNode }) => {
  const [type, setType] = useState<string | null>(null);

  return (
    <DnDContext.Provider value={[type, setType]}>
      {children}
    </DnDContext.Provider>
  );
}

export default DnDContext;

export const useDnD = () => {
  return useContext(DnDContext);
}
