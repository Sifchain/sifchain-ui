import { flagsStore } from "~/store/modules/flags";
import * as dat from "dat.gui";

export const createGui = () => {
  const gui = new dat.GUI({
    load: {
      preset: "Default",
      closed: true,
    },
    autoPlace: false,
    width: 400,
  });

  gui.useLocalStorage = true;

  Object.assign(gui.domElement.style, {
    zIndex: 30,
    position: "fixed",
    top: "48px",
    right: 0,
  });
  gui.domElement.querySelector(".close-button")?.remove();
  gui.show();

  Object.keys(flagsStore.state).forEach((key) => {
    if (key !== "enableTestChains") {
      gui.add(flagsStore.state, key);
    }
  });
  Object.keys(flagsStore.state.enableTestChains).forEach((network) => {
    gui
      .add(flagsStore.state.enableTestChains, network)
      .name("Enable Test Chain: " + network);
  });

  return gui;
};
