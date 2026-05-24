import { useEffect, useState } from "react";

export function useStorageSync<T>(read: () => T): T {
  const [value, setValue] = useState<T>(read);
  useEffect(() => {
    const sync = () => setValue(read());
    sync();
    window.addEventListener("insano-storage", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("insano-storage", sync);
      window.removeEventListener("storage", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}
