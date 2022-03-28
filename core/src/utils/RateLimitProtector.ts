export default class RateLimitProtector {
  padding: number;
  lastInvokation: number;
  backOfLine: Promise<void>;
  constructor({ padding }: { padding: number }) {
    this.padding = padding;
    this.lastInvokation = 0;
    this.backOfLine = Promise.resolve();
  }

  get waitTime() {
    let time = Date.now();
    let timeSinceLastCall = time - this.lastInvokation;
    let timeToWait = Math.max(this.padding - timeSinceLastCall, 0);
    return timeToWait;
  }

  shieldAll(obj: any, context: any) {
    for (let prop in obj) {
      let item = obj[prop];
      if (item instanceof Function) {
        obj[prop] = this.buildAsyncShield(item, context);
      }
    }
  }

  buildAsyncShield(fn: Function, context: any) {
    let self = this;
    if (context != undefined) {
      fn = fn.bind(context);
    }
    let shieldFn = async (...args: any[]) => {
      let shieldPromiseToWaitFor = this.backOfLine;
      let resolver: Function | undefined;
      this.backOfLine = new Promise((_resolve) => {
        resolver = _resolve;
      });
      await shieldPromiseToWaitFor;
      let waitTime = self.waitTime;
      if (waitTime) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
      self.lastInvokation = Date.now();
      resolver?.();
      return fn(...args);
    };
    let shield = {
      async [fn.name](...args: any[]) {
        return shieldFn(...args);
      },
    }[fn.name];
    return shield;
  }
}
