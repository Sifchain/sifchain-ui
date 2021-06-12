import { Claim, ClaimArgs } from "./claim";

let services: ClaimArgs;
let claim: jest.Mock<any, any>;
let signAndBroadcast: jest.Mock<any, any>;

beforeEach(() => {
  signAndBroadcast = jest.fn(() => Promise.resolve({ state: "accepted" }));
  claim = jest.fn(() => Promise.resolve());
  services = {
    dispensation: { claim },
    sif: { signAndBroadcast },
  };
});

const claimTests = [{ rewardType: "vs" }, { rewardType: "lm" }];

claimTests.forEach(({ rewardType }) => {
  test(`make ${rewardType} claim`, async () => {
    claim.mockReturnValue(Promise.resolve({ value: { msg: "swap message" } }));
    // signAndBroadcast.mockRejectedValue(
    //   Promise.resolve({ value: { msg: "swap message" } }),
    // );
    const claimFn = Claim(services);
    await claimFn({
      claimType: "3",
      fromAddress: "123",
    });
  });
});

/*
    fail - claim already made
    code: 1
    codespace: "dispensation"
    gas_used: "146978"
    gas_wanted: "500000"
    height: "1109965"
    raw_log: "internal"
    txhash: "A424D369E04CFE7E33A52D2D737167C13CD35C5E116AB3100FAB600FF1602794"
*/
