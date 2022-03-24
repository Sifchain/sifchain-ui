export class NativeDexTransaction {
    constructor(fromAddress, msgs, fee = {
        gas: "",
        price: {
            denom: "",
            amount: "",
        },
    }, memo = "") {
        this.fromAddress = fromAddress;
        this.msgs = msgs;
        this.fee = fee;
        this.memo = memo;
    }
}
export class NativeDexSignedTransaction {
    constructor(raw, signed) {
        this.raw = raw;
        this.signed = signed;
    }
}
//# sourceMappingURL=NativeDexTransaction.js.map