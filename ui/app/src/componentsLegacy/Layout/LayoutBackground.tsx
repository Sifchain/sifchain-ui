import AssetIcon from "@/components/AssetIcon";
import { Tooltip, TooltipInstance } from "@/components/Tooltip";
import { useCore } from "@/hooks/useCore";
import { computed, PropType, Ref, watch } from "vue";
import {
  DefineComponent,
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
} from "@vue/runtime-core";

const layoutBgKey = "layout_bg";
const layoutBgDefault = "default";

type LayoutCmpProps = { bg: Ref<LayoutBg>; src: Ref<string> };
type LayoutBg = {
  key: string;
  src: string[];
  thumb: string;
  Cmp: ((props: LayoutCmpProps) => JSX.Element) | typeof ImageBg;
};

const loadedCache = new Map<string, boolean>();
const ImageBg = defineComponent({
  name: "ImageBg",
  props: {
    src: {
      type: Object as PropType<Ref<string>>,
      required: true,
    },
    bg: {
      type: Object as PropType<Ref<LayoutBg>>,
      required: true,
    },
  },
  setup(props) {
    const loadedRef = ref(
      loadedCache.has(props.src.value) ||
        props.src.value === props.bg.value.thumb,
    );

    onMounted(() => {
      if (loadedRef.value) return;
      const img = document.createElement("img");
      img.src = props.src.value;
      img.onload = () => {
        loadedRef.value = true;
      };
    });
    const getStyle = (src: string) => ({
      backgroundImage: `url(${src})`,
      backgroundSize: "cover",
      backgroundPosition: "top center",
      backgroundAttachment: "fixed",
      backgroundRepeat: "no-repeat",
    });

    return () => {
      if (props.src.value === props.bg.value.thumb) {
        return (
          <div class="absolute inset-[8px] overflow-hidden opacity-80">
            <img class="w-full h-full object-cover" src={props.src.value} />
          </div>
        );
      }
      return (
        <div
          class={[
            "absolute inset-0 transition-all",
            loadedRef.value ? "filter-none" : "filter blur-md",
          ]}
        >
          <div
            class="absolute inset-0 z-[-1] transition-all"
            style={getStyle(props.bg.value.thumb)}
          />
          <div
            class={[
              "absolute inset-0 z-0 transition-all",
              loadedRef.value ? "opacity-100" : "opacity-0",
            ]}
            style={getStyle(props.src.value)}
          />

          <div class={["bg-black inset-0 absolute bg-opacity-20"]} />
        </div>
      );
    };
  },
});
const LAYOUT_BACKGROUNDS: LayoutBg[] = [
  {
    key: "default",
    src: [require("@/assets/backgrounds/default.webp")],
    thumb: require("@/assets/backgrounds/default-thumb.webp"),
    Cmp: ImageBg,
  },
  {
    key: "forest-butterflies",
    src: [
      require("@/assets/backgrounds/forest-butterflies-1x.webp"),
      require("@/assets/backgrounds/forest-butterflies-2x.webp"),
      require("@/assets/backgrounds/forest-butterflies-4x.webp"),
    ],
    thumb: require("@/assets/backgrounds/forest-butterflies-thumb.webp"),
    Cmp: ImageBg,
  },
  {
    key: "meadow",
    src: [
      require("@/assets/backgrounds/meadow-1x.webp"),
      require("@/assets/backgrounds/meadow-2x.webp"),
      require("@/assets/backgrounds/meadow-4x.webp"),
    ],
    thumb: require("@/assets/backgrounds/meadow-thumb.webp"),
    Cmp: ImageBg,
  },
  {
    key: "dark-forest",
    src: [
      require("@/assets/backgrounds/dark-forest-1x.webp"),
      require("@/assets/backgrounds/dark-forest-2x.webp"),
      require("@/assets/backgrounds/dark-forest-4x.webp"),
    ],
    thumb: require("@/assets/backgrounds/dark-forest-thumb.webp"),
    Cmp: ImageBg,
  },
  {
    key: "temple",
    src: [
      require("@/assets/backgrounds/temple-1x.webp"),
      require("@/assets/backgrounds/temple-2x.webp"),
      require("@/assets/backgrounds/temple-4x.webp"),
    ],
    thumb: require("@/assets/backgrounds/temple-thumb.webp"),
    Cmp: ImageBg,
  },
  {
    key: "trail",
    src: [
      require("@/assets/backgrounds/trail-1x.webp"),
      require("@/assets/backgrounds/trail-2x.webp"),
      require("@/assets/backgrounds/trail-4x.webp"),
    ],
    thumb: require("@/assets/backgrounds/trail-thumb.webp"),
    Cmp: ImageBg,
  },
  {
    key: "view",
    src: [
      require("@/assets/backgrounds/view-1x.webp"),
      require("@/assets/backgrounds/view-2x.webp"),
      require("@/assets/backgrounds/view-4x.webp"),
    ],
    thumb: require("@/assets/backgrounds/view-thumb.webp"),
    Cmp: ImageBg,
  },
  {
    key: "dark",
    src: [
      require("@/assets/backgrounds/dark-coin-1x.webp"),
      require("@/assets/backgrounds/dark-coin-2x.webp"),
      require("@/assets/backgrounds/dark-coin-4x.webp"),
    ],
    thumb: require("@/assets/backgrounds/dark-coin-thumb.webp"),
    Cmp: (props) => {
      return (
        <div class="w-full h-full relative bg-black">
          <img src={props.src.value} class="w-[42%]" />
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
    Cmp: (props) => {
      return (
        <div class="w-full h-full relative bg-[#3B7FBA] flex items-center justify-end">
          <img src={props.src.value} class="w-[47%]" />
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
      const bg =
        LAYOUT_BACKGROUNDS.find(
          (item) => item.key === backgroundKeyRef.value,
        ) || LAYOUT_BACKGROUNDS.find((item) => item.key === layoutBgDefault);
      if (!bg) throw new Error("no bg");
      return bg;
    });

    const srcRef = computed(() => {
      if (bgRef.value) return getSrc(bgRef.value);
      return "";
    });

    return () => (
      <>
        <div
          id="layout-bg"
          class="z-[-1] w-full h-[100vh] fixed top-0 left-0 transition-all duration-500"
        >
          {!!srcRef.value && (
            <bgRef.value.Cmp key={bgRef.value.key} src={srcRef} bg={bgRef} />
          )}
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
                      "w-1/3 p-[8px] relative rounded-sm cursor-pointer hover:bg-gray-600 w-[133px] h-[94px]",
                    ]}
                  >
                    <bg.Cmp src={ref(bg.thumb)} bg={ref(bg)} />
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
