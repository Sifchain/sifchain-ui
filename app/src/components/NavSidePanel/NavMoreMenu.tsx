import { flagsStore } from "~/store/modules/flags";
import { defineComponent } from "vue";

export default defineComponent({
  name: "NavMoreMenu",
  props: {
    onAction: {
      type: Function,
    },
  },
  setup(props) {
    const items = [
      {
        name: "Documentation",
        href: "https://docs.sifchain.network/sifchain/using-the-dex/web-ui-step-by-step",
      },
      {
        name: "Newsletter",
        href: "https://www.sifchain.finance/#newsletter",
      },
      {
        name: "Legal Disclaimer",
        href: "https://sifchain.network/legal-disclaimer",
      },
      {
        name: "Roadmap",
        href: "https://www.sifchain.finance/#roadmap",
      },
      {
        name: "Tutorials",
        href: "https://www.youtube.com/playlist?list=PLj5x_t273CNiBvcH6GjI9gBPzMFm9BlCL",
      },
      {
        name: "Privacy Policy",
        href: "https://assets.website-files.com/60ec70152eafa8dd30cb2fb5/610027e2774f5414365608b0_Sifchain-Website-Privacy-Policy.pdf",
      },
      {
        name: "Rewards Calculator",
        href: "#/calculator",
        hidden: !flagsStore.state.rewardsCalculator,
      },
    ].filter((x) => !x.hidden);

    return () => (
      <div onClick={() => props.onAction?.()}>
        {items.map((item) => (
          <a
            key={item.name}
            class="active:text-accent-base flex h-[23px] cursor-pointer items-center text-sm text-gray-800 no-underline hover:text-white"
            href={item.href}
            rel={item.href.startsWith("#") ? undefined : "noreferrer noopener"}
            target={item.href.startsWith("#") ? undefined : "_blank"}
          >
            {item.name}
          </a>
        ))}
      </div>
    );
  },
});
