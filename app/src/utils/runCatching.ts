const runCatching = async <TValue, TError extends Error>(
  func: () => TValue,
): Promise<[undefined, Awaited<TValue>] | [TError, undefined]> => {
  try {
    return [undefined, await func()];
  } catch (error: any) {
    return [error, undefined];
  }
};

export default runCatching;
