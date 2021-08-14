const gasSample: {
  transferMsgCount: number;
  gas: number;
}[] = [
  {
    transferMsgCount: 0,
    gas: 0,
  },
  {
    transferMsgCount: 1,
    gas: 79048,
  },
  {
    transferMsgCount: 2,
    gas: 110910,
  },
  {
    transferMsgCount: 16,
    gas: 545506,
  },
  {
    transferMsgCount: 32,
    gas: 1100914,
  },
  {
    transferMsgCount: 128,
    gas: 3895936,
  },
  {
    transferMsgCount: 256,
    gas: 7791872,
  },
];

export function calculateGasByClosestTransferMsgCount(
  transferMsgCount: number,
) {
  let linearGasSlope = 0;
  for (let [gasIndex, gasPoint] of gasSample.entries()) {
    if (gasIndex == 0) continue;
    if (transferMsgCount >= gasPoint.transferMsgCount) {
      linearGasSlope =
        (gasPoint.gas - gasSample[gasIndex - 1].gas) /
        (gasPoint.transferMsgCount - gasSample[gasIndex - 1].transferMsgCount);
    }
  }
  return linearGasSlope * transferMsgCount;
}
