const createTemplateFunction = <T extends (arg?: string) => any>(cb: T) => {
  return (...templateLiteral: Parameters<typeof String.raw>): ReturnType<T> => {
    const str = String.raw(...templateLiteral);
    return cb(str);
  };
};
export const createGraphQLClient = (url: string) =>
  createTemplateFunction((query) => {
    let variables: any;
    const request = (): Promise<any> =>
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query,
          ...(variables ? { variables } : {}),
        }),
      })
        .then((r) => r.json())
        .then((r) => {
          if (r.data == null) {
            console.error("GraphQL error", r);
            throw new Error(r.errors?.[0]?.message || "Unknown Error Occurred");
          }
          return r.data;
        });
    return createInvocablePromise<any>(
      (vars: any) => {
        variables = vars;
        return request();
      },
      (resolve, reject) => {
        const timeout = setTimeout(() => {
          if (variables) return resolve(true);
          return resolve(request());
        }, 0);
      },
    );
  });

type Fn = (...args: any[]) => any;

function createInvocablePromise<
  PromiseReturnType,
  FunctionType extends Fn = Fn
>(
  fn: FunctionType,
  promiseCb: ConstructorParameters<typeof Promise>[0],
): Promise<PromiseReturnType> & Fn {
  const promiseDescriptors = Object.getOwnPropertyDescriptors(
    Promise.prototype,
  );
  const promiseInstance = new Promise(promiseCb);
  for (const thing in promiseDescriptors) {
    promiseDescriptors[thing].value = promiseDescriptors[thing].value.bind(
      promiseInstance,
    );
  }
  Object.defineProperties(fn, promiseDescriptors);
  return (fn as unknown) as Promise<PromiseReturnType> & Fn;
}
