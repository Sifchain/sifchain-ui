import { EventEmitter } from "events";

interface TypedEmitterInterface<Type, Payload> {
  addListener(event: Type, listener: (payload: Payload) => void): this;
  on(event: Type, listener: (Type: Payload) => any): this;

  once(event: Type, listener: (Type: Payload) => any): this;
  prependListener(event: Type, listener: (Type: Payload) => any): this;
  prependOnceListener(event: Type, listener: (Type: Payload) => any): this;

  off(event: Type, listener: (Type: Payload) => any): this;
  removeAllListeners(event?: Type): this;
  removeListener(event: Type, listener: (Type: Payload) => any): this;

  emit(event: Type, payload?: Payload): boolean;
  eventNames(): (keyof Type | string | symbol)[];
  rawListeners(event: Type): Function[];
  listeners(event: Type): Function[];
  listenerCount(event: Type): number;

  getMaxListeners(): number;
  setMaxListeners(maxListeners: number): this;
}

const createPromiseResolver = () => {
  let resolve: (x?: any) => void;
  let promise: Promise<unknown> | null = new Promise((r) => (resolve = r));

  return {
    promise,
    // @ts-ignore
    resolve,
  };
};

export class IterableEmitter<Type, Payload> {
  emitter: TypedEmitterInterface<Type, Payload>;
  isComplete = false;

  emit: TypedEmitterInterface<Type, Payload>["emit"];
  on: TypedEmitterInterface<Type, Payload>["on"];

  private promiseResolver: ReturnType<typeof createPromiseResolver> | null;
  private eventQueue: { type: Type; payload: Payload }[] = [];

  private processEvent(event: Type, payload: Payload) {
    this.eventQueue.push({ type: event, payload });
    this.promiseResolver?.resolve();
    this.promiseResolver = null;
  }

  constructor() {
    this.emitter = (new EventEmitter() as unknown) as TypedEmitterInterface<
      Type,
      Payload
    >;
    this.emit = this.emitter.emit.bind(this.emitter);
    this.on = this.emitter.on.bind(this.emitter);

    const _emit = this.emit;
    this.emit = (event: Type, payload: Payload) => {
      console.log(event, payload);
      this.processEvent(event, payload);
      return _emit.call(this, event, payload);
    };
    this.promiseResolver = createPromiseResolver();
  }

  setGeneratorCompleted() {
    this.isComplete = true;
  }

  async *_generator(): AsyncGenerator<{ type: Type; payload: Payload }> {
    while (!this.isComplete) {
      if (this.eventQueue.length) {
        const event = this.eventQueue.shift();
        if (event) yield event;
      } else {
        if (this.isComplete) {
          break;
        } else {
          if (!this.promiseResolver) {
            this.promiseResolver = createPromiseResolver();
          }
          await this.promiseResolver.promise;
        }
      }
    }
  }
}
