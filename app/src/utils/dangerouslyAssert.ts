export default function dangerouslyAssert<T>(
  value: unknown,
): asserts value is T {}
