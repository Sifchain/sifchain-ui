import { IconName } from "@/componentsLegacy/utilities/AssetIcon";
import ImportModal from "./ImportModal/ImportModal";
import ConnectWalletModal from "./ConnectWalletModal/ConnectWalletModal";

export type ModalId = "import" | "connect";

export type ModalDefinition = {
  id: ModalId;
  Component: any;
  icon: (props: object) => IconName;
  heading: (props: object) => string;
};

export const modalDefinitions: Array<ModalDefinition> = [
  {
    id: "import",
    Component: ImportModal,
    icon: () => "interactive/arrow-down" as IconName,
    heading: () => "Import Token",
  },
  {
    id: "connect",
    Component: ConnectWalletModal,
    icon: () => "interactive/arrows-in" as IconName,
    heading: () => "Connect Wallet",
  },
];
