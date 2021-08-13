import { EventEmitter } from "events";
import { createIteratorSubject } from "./iteratorSubject";

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

type IterableEmitterEvent<T, P> = { type: T; payload: P };

export class IterableEmitter<EventTypes, EventPayload> {
  private isComplete = false;

  subject = createIteratorSubject<
    IterableEmitterEvent<EventTypes, EventPayload>
  >();

  emitter = (new EventEmitter() as unknown) as TypedEmitterInterface<
    EventTypes,
    EventPayload
  >;
  emit: TypedEmitterInterface<EventTypes, EventPayload>["emit"];
  on: TypedEmitterInterface<EventTypes, EventPayload>["on"];

  constructor() {
    this.on = this.emitter.on.bind(this.emitter);

    this.emit = (event: EventTypes, payload: EventPayload) => {
      if (this.isComplete) {
        throw new Error(
          `Cannot emit event ${event} after IterableEmitter is complete!`,
        );
      }
      this.subject.feed({ type: event, payload });
      return this.emitter.emit(event, payload);
    };
  }

  completeExecution() {
    this.isComplete = true;
    this.emitter.removeAllListeners();
    this.subject.end();
  }
}
