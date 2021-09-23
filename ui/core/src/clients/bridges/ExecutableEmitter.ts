import { EventEmitter } from "events";
import { createIteratorSubject } from "../../utils/iteratorSubject";
import { defer } from "../../utils/defer";

const EXECUTE_EVENT = "execute";
const VALUE_EVENT = "value";
const END_EVENT = "end";

/*
 * IterableEmitter creates an emitter that has 'not executing', 'executing', 'complete' states.
 * After running 'execute()' on the emitter, it will start and allow events until `complete()` is called.
 * During execution all emitted events will be passed to an iterator, which can be listened to
 * via generator().
 */
export class IterableEmitter<EventType> {
  private state: "not_started" | "executing" | "completed" = "not_started";

  private emitter = new EventEmitter();
  subject = createIteratorSubject<EventType>();

  assertExecuting() {
    if (this.state !== "executing") {
      throw new Error(
        `Expected state to be "executing", instead state is "${this.state}"`,
      );
    }
  }

  private listen(eventName: string, callback: (value: any) => void) {
    this.assertExecuting();

    this.emitter.on(eventName, callback);
    const unlisten = () => {
      this.emitter.off(eventName, callback);
    };
    return unlisten;
  }

  onExecute(callback: (value: any) => void) {
    return this.listen(EXECUTE_EVENT, callback);
  }
  onValue(callback: (value: any) => void) {
    return this.listen(VALUE_EVENT, callback);
  }
  onCompleted(callback: (value: any) => void) {
    return this.listen(VALUE_EVENT, callback);
  }

  generator() {
    return this.subject.iterator;
  }

  emit(event: EventType) {
    this.assertExecuting();

    this.subject.feed(event);
    this.emitter.emit(VALUE_EVENT, event);
  }

  execute() {
    this.state = "executing";
    this.emitter.emit(EXECUTE_EVENT);
  }
  complete() {
    this.state = "completed";
    this.emitter.removeAllListeners();
    this.emitter.emit(END_EVENT);
    this.subject.end();
  }
}

export class ExecutableEmitter<
  EventType,
  ResultType
> extends IterableEmitter<EventType> {
  private deferred = defer<ResultType>();

  constructor(
    private fn: (
      emit: IterableEmitter<EventType>["emit"],
    ) => Promise<ResultType | undefined>,
  ) {
    super();
  }

  execute() {
    super.execute();
    this.fn(this.emit.bind(this))
      .then((tx) => {
        this.complete(undefined, tx);
      })
      .catch((error) => {
        console.error(error);
        this.complete(error);
      });
  }

  awaitResult() {
    return this.deferred.promise;
  }

  async complete(error?: Error, result?: ResultType) {
    super.complete();
    if (error) {
      this.deferred.reject(error);
    } else {
      this.deferred.resolve(result);
    }
  }
}
