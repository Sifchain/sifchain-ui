<script lang="ts">
import { computed, defineComponent } from "vue";
import { reactive, ref, Ref } from "@vue/reactivity"; /* eslint-disable-line */
import { useCore } from "@/hooks/useCore";
import { AppEvent } from "@sifchain/sdk/src/services/EventBusService";
import { Notification } from "./types";
import { NotificationElement } from "./NotificationElement";
import { formatAssetAmount } from "@/componentsLegacy/shared/utils";

// Visual Notifications are a view level system here we work out which ones are displayed to the user
function parseEventToNotifications(event: AppEvent): Notification | null {
  if (event.type === "NoLiquidityPoolsFoundEvent") {
    return {
      type: "error",
      message: "No Liquidity Pools Found",
    };
  }

  if (event.type === "TransactionErrorEvent") {
    return {
      type: "error",
      message: event.payload.message,
    };
  }

  if (
    event.type === "PegTransactionPendingEvent" ||
    event.type === "PegTransactionErrorEvent" ||
    event.type === "PegTransactionCompletedEvent"
  ) {
    const title = `${formatAssetAmount(
      event.payload.interchainTx.assetAmount,
    )} ${event.payload.interchainTx.assetAmount.displaySymbol.toUpperCase()} from ${
      event.payload.interchainTx.fromChain.displayName
    }`;

    if (event.type === "PegTransactionPendingEvent") {
      return {
        id: event.payload.interchainTx.hash,
        type: "info",
        message: `Import Pending: ${title}...`,
        loader: true,
      };
    } else if (event.type === "PegTransactionErrorEvent") {
      return {
        id: event.payload.interchainTx.hash,
        type: "error",
        message: ["Import Error", event.payload.transactionStatus.memo || ""]
          .filter((i) => i !== "")
          .join(": "),
      };
    } else if (event.type === "PegTransactionCompletedEvent") {
      return {
        id: event.payload.interchainTx.hash,
        type: "success",
        message: `Import Complete! ${title}`,
      };
    }
  }

  if (event.type === "WalletConnectedEvent") {
    return null;
    // const message = {
    //   sif: "Sif Account Connected",
    //   eth: "Connected to Metamask",
    // }[event.payload.walletType];
    // return {
    //   type: "success",
    //   message,
    // };
  }

  if (
    event.type === "ErrorEvent" ||
    event.type === "SuccessEvent" ||
    event.type === "InfoEvent"
  ) {
    return {
      type:
        event.type === "SuccessEvent"
          ? "success"
          : event.type === "InfoEvent"
          ? "info"
          : "error",
      message: event.payload.message,
    };
  }

  if (event.type === "WalletConnectionErrorEvent") {
    return {
      type: "error",
      message: event.payload.message,
    };
  }

  console.error("Have not captured event", JSON.stringify(event));
  return null;
}

export default defineComponent({
  name: "Notifications",
  components: {
    NotificationElement,
  },
  setup() {
    const { services } = useCore();
    const notifications = reactive<Notification[]>([]);

    services.bus.onAny((event) => {
      const notification = parseEventToNotifications(event);

      if (notification?.id) {
        // If an id is specified, remove other notifications with same id
        notifications.forEach((item, index) => {
          if (item.id === notification.id)
            notifications.splice(notifications.indexOf(item), 1);
        });
      }
      if (notification !== null) notifications.unshift(notification);
    });

    return {
      notifications,
      removeItem(index: any) {
        notifications.splice(index, 1);
      },
    };
  },
});
</script>

<template>
  <div class="notifications-container z-50">
    <transition-group name="list">
      <NotificationElement
        v-for="(item, index) in notifications"
        v-bind:key="item.id"
        :index="index"
        :onRemove="removeItem"
        :notification="item"
      />
    </transition-group>
  </div>
</template>

<style lang="scss" scoped>
.notifications-container {
  position: fixed;
  bottom: 20px;
  right: 40px;
  height: auto;
  .list-enter-active,
  .list-leave-active {
    transition: all 0.5s ease;
  }
  .list-enter-from,
  .list-leave-to {
    opacity: 0;
    transform: translateX(200px);
  }
}
</style>
