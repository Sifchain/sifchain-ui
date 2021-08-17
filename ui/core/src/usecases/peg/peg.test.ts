import { AssetAmount } from "../../entities";
import { getTestingTokens } from "../../test/utils/getTestingToken";
import { Peg, PegEvent, PegSentEvent } from "./peg";

const [ETH, ATK] = getTestingTokens(["ETH", "ATK"]);

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
  let SubscribeToTx = () => subscribeToTx;
  let peg = Peg(
    {
      ethbridge,
      bus,
      ibc: {
        transferIBCTokens: jest.fn(),
        checkIfPacketReceived: jest.fn(),
      },
    },
    { wallet, tx },
    { ethConfirmations: 50 },
    SubscribeToTx,
  );
  return { peg, wallet, bus, ethbridge };
}

describe("Peg", () => {
  describe("when pegging eth", () => {
    it("should peg transactions", async () => {
      let amount = AssetAmount(ETH, "10");
      const { peg, ethbridge } = createPeg();
      const iter = peg(amount);

      let packet: IteratorResult<PegEvent, PegEvent>;

      packet = await iter.next();

      expect(packet.value.type).toBe("signing");

      ethbridge.lockToSifchain.mockReturnValue({
        onTxHash: (f: Function) => f({ txHash: "hash123" }),
      });
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
  describe("when pegging erc20", () => {
    let amount = AssetAmount(ATK, "10");

    test("rejecting approval", async () => {
      const { peg, ethbridge } = createPeg();
      ethbridge.approveBridgeBankSpend.mockRejectedValue("Yikes!");

      const iter = peg(amount);
      let packet: IteratorResult<PegEvent, PegEvent>;
      packet = await iter.next();
      expect(packet.value.type).toBe("approve_started");
      packet = await iter.next();
      expect(packet.value.type).toBe("approve_error");
      packet = await iter.next();
      expect(packet.done).toBe(true);
    });

    test("accepting approval", async () => {
      const { peg, ethbridge } = createPeg();
      ethbridge.approveBridgeBankSpend.mockReturnValue(Promise.resolve());
      ethbridge.lockToSifchain.mockReturnValue({
        onTxHash: (f: Function) => f({ txHash: "hash123" }),
      });

      const iter = peg(amount);

      let packet: IteratorResult<PegEvent>;
      packet = await iter.next();

      expect(packet.value.type).toBe("approve_started");
      packet = await iter.next();
      expect(packet.value.type).toBe("approved");

      packet = await iter.next();

      expect(packet.value.type).toBe("signing");
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

      wallet.get(Network.ETHEREUM).chainId = "0x23";
      const amount = AssetAmount(ETH, "10");
      const iter = peg(amount);

      let packet: IteratorResult<PegEvent, PegEvent>;

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
