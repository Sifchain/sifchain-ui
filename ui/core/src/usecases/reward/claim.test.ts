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
  test(`make ${rewardType} failed claim because already claimed`, async () => {
    claim.mockReturnValue(
      Promise.resolve({
        type: "cosmos-sdk/StdTx",
        value: {
          msg: [
            {
              type: "dispensation/claim",
              value: {
                user_claim_address:
                  "sif1syavy2npfyt9tcncdtsdzf7kny9lh777yqc2na",
                user_claim_type: "2",
              },
            },
          ],
        },
      }),
    );
    signAndBroadcast.mockReturnValue(
      Promise.resolve({
        code: 3,
        hash:
          "814C5AFD654FF5C1E32E7CF0E4235C56D22BE00779A1339F5490369D3C01EC6A",
        memo: "There was an unknown failure",
        state: "failed",
      }),
    );
    const claimFn = Claim(services);
    await claimFn({
      claimType: "2",
      fromAddress: "sif1syavy2npfyt9tcncdtsdzf7kny9lh777yqc2na",
    });
  });
});
