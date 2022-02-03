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
        name: "Stake",
        href: "https://wallet.keplr.app/#/sifchain/stake",
      },
      {
        name: "Documentation",
        href: "https://docs.sifchain.finance/resources/sifchain-dex-ui",
      },
      {
        name: "Newsletter",
        href: "https://sifchain.finance/#newsletter",
      },
      {
        name: "Legal Disclaimer",
        href: "https://sifchain.finance/legal-disclamer/",
      },
      {
        name: "Roadmap",
        href: "https://sifchain.finance/#roadmap",
      },
      {
        name: "Tutorials",
        href: "https://www.youtube.com/playlist?list=PLj5x_t273CNiBvcH6GjI9gBPzMFm9BlCL",
      },
      {
        name: "Privacy Policy",
        href: "https://sifchain.finance/wp-content/uploads/2020/12/Sifchain-Website-Privacy-Policy.pdf",
      },
      {
        name: "Rewards Calculator",
        href: "#/calculator",
      },
    ];
    return () => (
      <div onClick={() => props.onAction?.()}>
        {items.map((item) => (
          <a
            key={item.name}
            class="text-sm text-gray-800 no-underline hover:text-white active:text-accent-base cursor-pointer flex items-center h-[23px]"
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
