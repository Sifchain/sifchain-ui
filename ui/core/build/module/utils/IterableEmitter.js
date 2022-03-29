import { EventEmitter } from "events";
import { createIteratorSubject } from "./iteratorSubject";
const VALUE_EVENT = "value";
const END_EVENT = "end";
export class IterableEmitter {
  constructor() {
    this.isEnded = false;
    this.emitter = new EventEmitter();
    this.subject = createIteratorSubject();
  }
  listen(eventName, callback) {
    if (this.isEnded) throw new Error("Cannot listen after ended!");
    this.emitter.on(eventName, callback);
    const unlisten = () => {
      this.emitter.off(eventName, callback);
    };
    return unlisten;
  }
  onValue(callback) {
    return this.listen(VALUE_EVENT, callback);
  }
  onEnd(callback) {
    return this.listen(END_EVENT, callback);
  }
  generator() {
    return this.subject.iterator;
  }
  emit(event) {
    if (this.isEnded) {
      throw new Error(
        `Cannot emit event ${event} after IterableEmitter is complete!`,
      );
    }
    this.subject.feed(event);
    this.emitter.emit(VALUE_EVENT, event);
  }
  end() {
    this.isEnded = true;
    this.emitter.removeAllListeners();
    this.emitter.emit(END_EVENT);
    this.subject.end();
  }
}
//# sourceMappingURL=IterableEmitter.js.map
