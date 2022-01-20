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
        href:
          "https://docs.sifchain.finance/using-the-website/web-ui-step-by-step",
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
        href:
          "https://www.youtube.com/playlist?list=PLj5x_t273CNiBvcH6GjI9gBPzMFm9BlCL",
      },
      {
        name: "Privacy Policy",
        href:
          "https://sifchain.finance/wp-content/uploads/2020/12/Sifchain-Website-Privacy-Policy.pdf",
      },
    ];
    return () => (
      <div onClick={() => props.onAction?.()}>
        {items.map((item) => (
          <a
            key={item.name}
            class="text-sm text-gray-800 no-underline hover:text-white active:text-accent-base cursor-pointer flex items-center h-[23px]"
            href={item.href}
            rel="noreferrer noopener"
            target="_blank"
          >
            {item.name}
          </a>
        ))}
      </div>
    );
  },
});
