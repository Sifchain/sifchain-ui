import AssetIcon from "@/components/AssetIcon";
import { Tooltip, TooltipInstance } from "@/components/Tooltip";
import { useCore } from "@/hooks/useCore";
import { computed, Ref, watch } from "vue";
import {
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
} from "@vue/runtime-core";

const layoutBgKey = "layout_bg";
const layoutBgDefault = "default";

type LayoutBg = {
  key: string;
  src: string[];
  thumb: string;
  render?: (src: string) => JSX.Element;
};
const LAYOUT_BACKGROUNDS: LayoutBg[] = [
  {
    key: "default",
    src: [require("@/assets/backgrounds/default.webp")],
    thumb: require("@/assets/backgrounds/default-thumb.webp"),
  },
  {
    key: "forest-butterflies",
    src: [
      require("@/assets/backgrounds/forest-butterflies-1x.webp"),
      require("@/assets/backgrounds/forest-butterflies-2x.webp"),
      require("@/assets/backgrounds/forest-butterflies-4x.webp"),
    ],
    thumb: require("@/assets/backgrounds/forest-butterflies-thumb.webp"),
  },
  {
    key: "meadow",
    src: [
      require("@/assets/backgrounds/meadow-1x.webp"),
      require("@/assets/backgrounds/meadow-2x.webp"),
      require("@/assets/backgrounds/meadow-4x.webp"),
    ],
    thumb: require("@/assets/backgrounds/meadow-thumb.webp"),
  },
  // this one looks worse, and 6 makes picker ui look good (3x2)
  // {
  //   key: "night",
  //   src: [
  //     require("@/assets/backgrounds/night-1x.webp"),
  //     require("@/assets/backgrounds/night-2x.webp"),
  //     require("@/assets/backgrounds/night-4x.webp"),
  //   ],
  //   thumb: require("@/assets/backgrounds/night-thumb.webp"),
  // },
  {
    key: "temple",
    src: [
      require("@/assets/backgrounds/temple-1x.webp"),
      require("@/assets/backgrounds/temple-2x.webp"),
      require("@/assets/backgrounds/temple-4x.webp"),
    ],
    thumb: require("@/assets/backgrounds/temple-thumb.webp"),
  },
  {
    key: "trail",
    src: [
      require("@/assets/backgrounds/trail-1x.webp"),
      require("@/assets/backgrounds/trail-2x.webp"),
      require("@/assets/backgrounds/trail-4x.webp"),
    ],
    thumb: require("@/assets/backgrounds/trail-thumb.webp"),
  },
  {
    key: "view",
    src: [
      require("@/assets/backgrounds/view-1x.webp"),
      require("@/assets/backgrounds/view-2x.webp"),
      require("@/assets/backgrounds/view-4x.webp"),
    ],
    thumb: require("@/assets/backgrounds/view-thumb.webp"),
  },
  {
    key: "dark",
    src: [
      require("@/assets/backgrounds/dark-coin-1x.webp"),
      require("@/assets/backgrounds/dark-coin-2x.webp"),
      require("@/assets/backgrounds/dark-coin-4x.webp"),
    ],
    thumb: require("@/assets/backgrounds/dark-coin-thumb.webp"),
    render(src: string) {
      return (
        <div class="w-full h-full relative bg-black">
          <img src={src} class="w-[42%]" />
        </div>
      );
    },
  },
  {
    key: "gold",
    src: [
      require("@/assets/backgrounds/gold-1x.webp"),
      require("@/assets/backgrounds/gold-2x.webp"),
      require("@/assets/backgrounds/gold-4x.webp"),
    ],
    thumb: require("@/assets/backgrounds/gold-coin-thumb.webp"),
    render(src: string) {
      return (
        <div class="w-full h-full relative bg-[#3B7FBA] flex items-center justify-end">
          <img src={src} class="w-[47%]" />
        </div>
      );
    },
  },
];
export default defineComponent({
  name: "LayoutBackground",
  setup() {
    const { storage } = useCore().services;

    const backgroundKeyRef = ref(
      storage.getItem(layoutBgKey) || layoutBgDefault,
    );

    watch(
      () => backgroundKeyRef.value,
      (key) => {
        storage.setItem(layoutBgKey, key);
      },
    );

    const widthRef = ref(window.innerWidth);
    const updateWidth = () => {
      widthRef.value = window.innerWidth;
    };

    onMounted(() => {
      window.addEventListener("resize", updateWidth);
    });
    onUnmounted(() => {
      window.removeEventListener("resize", updateWidth);
    });

    const getSrc = (bg: LayoutBg) => {
      const base = 1440;
      const index =
        widthRef.value > base * 2 ? 2 : widthRef.value > base * 1.5 ? 1 : 0;
      return bg?.src[index] || bg?.src[0];
    };

    const bgRef = computed(() => {
      return (
        LAYOUT_BACKGROUNDS.find(
          (item) => item.key === backgroundKeyRef.value,
        ) || LAYOUT_BACKGROUNDS.find((item) => item.key === layoutBgDefault)
      );
    });

    const srcRef = computed(() => {
      if (bgRef.value) return getSrc(bgRef.value);
    });

    return () => (
      <>
        <div
          id="layout-bg"
          class="z-[-1] w-full h-[100vh] fixed top-0 left-0 transition-all duration-500"
          style={
            !bgRef.value?.render
              ? {
                  backgroundImage: `url(${srcRef.value})`,
                  backgroundSize: "cover",
                  backgroundPosition: "top center",
                  backgroundAttachment: "fixed",
                  backgroundRepeat: "no-repeat",
                }
              : {}
          }
        >
          {bgRef.value?.render && bgRef.value.render(srcRef.value || "")}
        </div>
        <div class="absolute bottom-4 right-4 w-[36px] h-[36px]">
          <Tooltip
            placement="top-end"
            animation="scale"
            arrow={false}
            trigger="click"
            interactive
            onMount={(instance: TooltipInstance) => {
              instance.popper
                .querySelector(".tippy-box")
                ?.classList.add("!origin-bottom-right");
            }}
            maxWidth="none"
            appendTo={() => document.body}
            content={
              <div class="flex flex-wrap w-[400px]">
                {LAYOUT_BACKGROUNDS.map((bg) => (
                  <div
                    key={bg.key}
                    onClick={() => (backgroundKeyRef.value = bg.key)}
                    class={[
                      "w-1/3 p-[8px] relative rounded-sm cursor-pointer hover:bg-gray-600",
                    ]}
                  >
                    {bg.render ? (
                      bg.render(getSrc(bg) || "")
                    ) : (
                      <>
                        <img class="w-full" src={bg.thumb} />
                        <div
                          class={[
                            "bg-black inset-[8px] absolute bg-opacity-20",
                          ]}
                        ></div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            }
          >
            <div class="cursor-pointer">
              <AssetIcon
                icon="interactive/picture"
                class="text-white opacity-60"
                size={36}
              />
            </div>
          </Tooltip>
        </div>
      </>
    );
  },
});
