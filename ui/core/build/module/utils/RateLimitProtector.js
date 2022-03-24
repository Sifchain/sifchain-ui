var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default class RateLimitProtector {
    constructor({ padding }) {
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
    shieldAll(obj, context) {
        for (let prop in obj) {
            let item = obj[prop];
            if (item instanceof Function) {
                obj[prop] = this.buildAsyncShield(item, context);
            }
        }
    }
    buildAsyncShield(fn, context) {
        let self = this;
        if (context != undefined) {
            fn = fn.bind(context);
        }
        let shieldFn = (...args) => __awaiter(this, void 0, void 0, function* () {
            let shieldPromiseToWaitFor = this.backOfLine;
            let resolver;
            this.backOfLine = new Promise((_resolve) => {
                resolver = _resolve;
            });
            yield shieldPromiseToWaitFor;
            let waitTime = self.waitTime;
            if (waitTime) {
                yield new Promise((resolve) => setTimeout(resolve, waitTime));
            }
            self.lastInvokation = Date.now();
            resolver === null || resolver === void 0 ? void 0 : resolver();
            return fn(...args);
        });
        let shield = {
            [fn.name](...args) {
                return __awaiter(this, void 0, void 0, function* () {
                    return shieldFn(...args);
                });
            },
        }[fn.name];
        return shield;
    }
}
//# sourceMappingURL=RateLimitProtector.js.map