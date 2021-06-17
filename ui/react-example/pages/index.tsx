import { useSifchain } from "ui-core/lib/react";
export default function Home() {
  const [count, api] = useSifchain();
  return (
    <div>
      <div>{count}</div>
      <button onClick={api.increment}>+</button>
      <button onClick={api.decrement}>-</button>
    </div>
  );
}
