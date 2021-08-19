import { Chain } from "index";

export abstract class WalletProvider {
  enable(chain: Chain) {}

  getSigner(chain: Chain) {}
}
