import createActions, {
  VS_STORAGE_KEY,
  LM_STORAGE_KEY,
  BLOCK_TIME_MS,
} from "./";

import { Address, Asset, Network, TxParams } from "../../entities";
import { Msg } from "@cosmjs/launchpad";
import { IWalletService } from "../../services/IWalletService";
let mockCryptoeconomicsService: any;
let mockEventBusService: any;
let mockStore: any;
let rewardActions: ReturnType<typeof createActions>;
let dispatch = jest.fn();
let mockStorage: Map;
let mockCryptoeconomicsData: any;

beforeEach(() => {
  mockCryptoeconomicsService = {
    fetchData: jest.fn(),
  };
  mockEventBusService = {
    dispatch,
  };

  mockStorage = new Map();
  mockStore = {
    wallet: {
      sif: {
        address: "",
        lmUserData: null,
        vsUserData: null,
      },
    },
  };
  rewardActions = createActions({
    services: {
      cryptoeconomics: mockCryptoeconomicsService,
      bus: mockEventBusService,
      storage: {
        getItem: (key) => mockStorage.get(key),
        setItem: (key, value) => mockStorage.set(key, value),
      },
    },
    store: mockStore,
  });
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test("Do nothing if no wallet", async () => {
  rewardActions.notifyLmMaturity();
  expect(mockStorage.get(LM_STORAGE_KEY)).toBeUndefined();
  expect(mockEventBusService.dispatch).not.toHaveBeenCalled();

  rewardActions.notifyVsMaturity();
  expect(mockStorage.get(VS_STORAGE_KEY)).toBeUndefined();
  expect(mockEventBusService.dispatch).not.toHaveBeenCalled();
});

const subscribeTests = [
  { storeKey: "vsUserData", rewardType: "vs" },
  { storeKey: "lmUserData", rewardType: "lm" },
];
subscribeTests.forEach(({ storeKey, rewardType }) => {
  test(`subscribe to ${storeKey} data`, async () => {
    mockStore.wallet.sif.address = "123";
    const rewardData = {
      maturityDate: new Date(),
      totalClaimableCommissionsAndClaimableRewards: 0,
    };

    mockCryptoeconomicsService.fetchData.mockReturnValueOnce(rewardData);
    const cleanup = rewardActions.subscribeToRewardData(rewardType);

    await new Promise((resolve) => process.nextTick(resolve)); // wait for promise
    expect(mockStore.wallet.sif[storeKey]).toEqual(rewardData);

    // Wait for next block, it should call fetch again and update value
    mockCryptoeconomicsService.fetchData.mockReturnValueOnce({
      totalClaimableCommissionsAndClaimableRewards: 9001,
    });
    jest.advanceTimersByTime(BLOCK_TIME_MS + 1);
    await new Promise((resolve) => process.nextTick(resolve));
    expect(
      mockStore.wallet.sif[storeKey]
        .totalClaimableCommissionsAndClaimableRewards,
    ).toEqual(9001);

    mockCryptoeconomicsService.fetchData.mockReturnValueOnce({
      not: "allowed",
    });
    cleanup();
    jest.advanceTimersByTime(BLOCK_TIME_MS + 1);
    await new Promise((resolve) => process.nextTick(resolve));

    // Should not update because we cleaned up
    expect(
      mockStore.wallet.sif[storeKey]
        .totalClaimableCommissionsAndClaimableRewards,
    ).toEqual(9001);
  });
});

const notificationSuites = [
  {
    storeKey: "vsUserData",
    rewardType: "vs",
    serviceFn: "notifyVsMaturity",
    storageKey: VS_STORAGE_KEY,
  },
  {
    storeKey: "lmUserData",
    rewardType: "lm",
    serviceFn: "notifyLmMaturity",
    storageKey: LM_STORAGE_KEY,
  },
];
notificationSuites.forEach(
  ({ storeKey, rewardType, serviceFn, storageKey }) => {
    describe(serviceFn, () => {
      test("do not send notification: maturityDate not reached", async () => {
        mockStore.wallet.sif.address = "123";
        mockStore.wallet.sif[storeKey] = {
          maturityDate: new Date(Date.now() + 100 * 1000),
          totalClaimableCommissionsAndClaimableRewards: 100,
        };
        rewardActions[serviceFn]();
        expect(mockStorage.get(storageKey)).toBeUndefined();
        expect(mockEventBusService.dispatch).not.toHaveBeenCalled();
      });

      test("do not send notification: no claimable commissions", async () => {
        mockStore.wallet.sif.address = "123";
        mockStore.wallet.sif[storeKey] = {
          maturityDate: new Date(Date.now() - 100 * 1000),
          totalClaimableCommissionsAndClaimableRewards: 0,
        };
        rewardActions[serviceFn]();
        expect(mockStorage.get(storageKey)).toBeUndefined();
        expect(mockEventBusService.dispatch).not.toHaveBeenCalled();
      });

      test("only send once after conditions reached", async () => {
        mockStore.wallet.sif.address = "123";
        mockStore.wallet.sif[storeKey] = {
          maturityDate: new Date(Date.now() - 100 * 1000),
          totalClaimableCommissionsAndClaimableRewards: 100,
        };
        rewardActions[serviceFn]();
        expect(mockStorage.get(storageKey)).toEqual("true");
        expect(mockEventBusService.dispatch).toHaveBeenCalledTimes(1);
        mockEventBusService.dispatch.mockClear();

        rewardActions[serviceFn]();
        expect(mockEventBusService.dispatch).not.toHaveBeenCalled();
      });
    });
  },
);
