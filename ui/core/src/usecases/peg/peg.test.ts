import { AssetAmount } from "../../entities";
import { getTestingTokens } from "../../test/utils/getTestingToken";
import { Peg, PegEvent, PegSentEvent } from "./peg";

const [ETH] = getTestingTokens(["ETH"]);

function createPeg() {
  let ethbridge = {
    burnToSifchain: jest.fn(),
    lockToSifchain: jest.fn(),
    approveBridgeBankSpend: jest.fn().mockReturnValue(Promise.resolve()),
  };
  let bus = { dispatch: jest.fn() };
  let wallet: any = {
    eth: { address: "eth123", chainId: "0x539" },
    sif: { address: "sif123" },
  };
  let tx: any = {};
  let subscribeToTx = jest.fn();
  let SubScribeToTx = () => subscribeToTx;
  let peg = Peg(
    { ethbridge, bus },
    { wallet, tx },
    { ethConfirmations: 50 },
    SubScribeToTx,
  );
  return { peg, wallet, bus, ethbridge };
}

describe("Peg", () => {
  describe("when happy", () => {
    it("should peg transactions", async () => {
      const { peg, ethbridge } = createPeg();
      const amount = AssetAmount(ETH, "10");

      const iter = peg(amount);

      let packet: IteratorResult<PegEvent, PegEvent>;

      packet = await iter.next();

      expect(packet.value.type).toBe("started");

      // Approved
      packet = await iter.next();

      expect(packet.value.type).toBe("approved");
      expect(ethbridge.approveBridgeBankSpend).toBeCalledWith("eth123", amount);

      ethbridge.lockToSifchain.mockReturnValue({
        onTxHash: (f: Function) => f({ txHash: "hash123" }),
      });

      // Send
      packet = await iter.next();

      expect(packet.value.type).toBe("sent");
      expect((packet.value as PegSentEvent).tx).toEqual({
        hash: "hash123",
        memo: "Transaction Accepted",
        state: "accepted",
      });
      expect(ethbridge.burnToSifchain).not.toHaveBeenCalled();
      expect(ethbridge.lockToSifchain).toHaveBeenCalledWith(
        "sif123",
        amount,
        50,
      );
    });
  });

  describe("when wrong evm chain", () => {
    it("should return an error and supply a notification that the network isnt supported", async () => {
      const { peg, bus, wallet } = createPeg();

      wallet.eth.chainId = "0x23";
      const amount = AssetAmount(ETH, "10");
      const iter = peg(amount);

      let packet: IteratorResult<PegEvent, PegEvent>;

      packet = await iter.next();
      expect(packet.value.type).toBe("started");

      // Dont recognise that chain!
      packet = await iter.next();
      expect(bus.dispatch).toHaveBeenCalledWith({
        payload: { message: "EVM Network not supported!" },
        type: "ErrorEvent",
      });
      expect(packet.value.type).toBe("tx_error");
      expect(packet.done).toBe(true);
    });
  });
});
