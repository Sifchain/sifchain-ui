import { defineComponent } from "vue";
import AssetIcon from "../AssetIcon";

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
        name: "Stake",
        href: "https://wallet.keplr.app/#/sifchain/stake",
      },
      {
        name: "Documentation",
        href: "https://docs.sifchain.finance/using-the-website/web-ui-step-by-step",
      },
      {
        name: "Newsletter",
        href: "https://www.sifchain.finance/#newsletter",
      },
      {
        name: "Legal Disclaimer",
        href: "https://www.sifchain.finance/legal-disclamer/",
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
    ];

    return () => (
      <ul onClick={() => props.onAction?.()} class="w-sidebar grid gap-1">
        {items.map((item) => (
          <li
            key={item.name}
            class="group rounded-md p-1.5 px-3 hover:bg-black/80"
          >
            <a
              class="active:text-accent-base flex h-[23px] cursor-pointer items-center text-sm text-gray-400 no-underline hover:text-white"
              href={item.href}
              rel={
                item.href.startsWith("#") ? undefined : "noreferrer noopener"
              }
              target={item.href.startsWith("#") ? undefined : "_blank"}
            >
              {item.name}

              <AssetIcon
                icon="interactive/open-external"
                class="absolute right-4 text-gray-500 opacity-0 transition-opacity group-hover:opacity-100"
              />
            </a>
          </li>
        ))}
      </ul>
    );
  },
});
