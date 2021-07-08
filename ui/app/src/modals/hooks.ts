import Modal from "@/components/Modal";
import { IconName } from "@/componentsLegacy/utilities/AssetIcon.vue";
import router from "@/router";
import { computed, reactive } from "vue";
import { effect } from "@vue/reactivity";
import { useRoute } from "vue-router";
import { modalDefinitions, ModalId, ModalDefinition } from "./constants";
import { ImportModalProps } from "./ImportModal/ImportModal";
import { ConnectWalletModalProps } from "./ConnectWalletModal/ConnectWalletModal";

type ModalStackItem = {
  id: ModalId;
  props: object;
  definition: ModalDefinition;
};
const state = reactive<{
  stack: Array<ModalStackItem>;
}>({
  stack: [],
});

const syncStackToRouter = () => {
  router.replace({
    query: {
      modal: state.stack.map((item) => item.id),
      modalProps: state.stack.map((item) => JSON.stringify(item.props)),
    },
  });
};

function openRouteModal(id: ModalId, props: object) {
  const definition = modalDefinitions.find((d) => d.id === id);
  if (!definition) throw new Error("Invalid modal id " + id);
  if (state.stack.some((m) => m.id === id))
    throw new Error(id + " already open");

  state.stack.push({
    id,
    props,
    definition,
  });
  syncStackToRouter();
}

export function openImportModal(props: ImportModalProps) {
  return openRouteModal("import", props);
}
export function openConnectWalletModal(props: ConnectWalletModalProps) {
  return openRouteModal("connect", props);
}

export function closeRouteModal(modalId: ModalId) {
  state.stack = state.stack.filter((item) => item.id !== modalId);
  syncStackToRouter();
  console.log("closeRouteModal", state.stack);
}

export function useSetupRouteModals() {
  const route = useRoute();

  effect(() => {
    route.query;
    console.log("route.query", route.query);
    const params = new URLSearchParams(window.location.search);

    const allIds = params.getAll("modal");
    const allProps = params
      .getAll("modalProps")
      .map((item) => JSON.parse(decodeURIComponent(item)));

    state.stack = allIds
      .map((modalId, index) => {
        const definition = modalDefinitions.find((def) => def.id === modalId);
        if (!definition) {
          console.error("Invalid modal type given in url, ignoring:", modalId);
          // This null is filtered out below.
          return (null as unknown) as ModalStackItem;
        }
        return {
          id: modalId as ModalId,
          props: allProps[index],
          definition,
        };
      })
      .filter(Boolean);
  });

  return {
    state,
    closeRouteModal,
  };
}
