import { useState, useCallback } from "react";
type Api = { increment: () => void; decrement: () => void };
export function useSifchain(): [number, Api] {
  const [count, setState] = useState(0);
  const increment = useCallback(() => {
    setState((c) => c + 1);
  }, []);

  const decrement = useCallback(() => {
    setState((c) => c - 1);
  }, []);

  return [count, { increment, decrement }];
}
