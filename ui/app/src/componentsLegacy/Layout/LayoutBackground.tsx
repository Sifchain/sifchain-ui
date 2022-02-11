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
} from "vue";
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
        loadedCache.set(props.src.value, true);
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

const urls = import.meta.globEager("/src/assets/backgrounds/*.webp");

const getUrl = (name: string) =>
  urls[`/src/assets/backgrounds/${name}.webp`]?.default || "";

const LAYOUT_BACKGROUNDS: LayoutBg[] = [
  {
    key: "default",
    src: [getUrl("default")],
    thumb: getUrl("default-thumb"),
    Cmp: ImageBg,
  },
  ...["oQbLeq4nOek", "12R-hVfQ3R8", "-Lc6azmFSk4", "5Ui5glVjUAQ"].map(
    (name) => ({
      key: name,
      src: ["https://source.unsplash.com/" + name],
      thumb: "https://source.unsplash.com/" + name,
      Cmp: ImageBg,
    }),
  ),
  {
    key: "tropical-fern",
    src: ["https://source.unsplash.com/5TBf16GnHKg"],
    thumb: "https://source.unsplash.com/5TBf16GnHKg",
    Cmp: ImageBg,
  },
  {
    key: "tropical-fern-2",
    src: ["https://source.unsplash.com/7uNro4xWMnk"],
    thumb: "https://source.unsplash.com/7uNro4xWMnk",
    Cmp: ImageBg,
  },
  {
    key: "forest-butterflies",
    src: [
      getUrl("forest-butterflies-1x"),
      getUrl("forest-butterflies-2x"),
      getUrl("forest-butterflies-4x"),
    ],
    thumb: getUrl("forest-butterflies-thumb"),
    Cmp: ImageBg,
  },
  {
    key: "meadow",
    src: [getUrl("meadow-1x"), getUrl("meadow-2x"), getUrl("meadow-4x")],
    thumb: getUrl("meadow-thumb"),
    Cmp: ImageBg,
  },
  {
    key: "dark-forest",
    src: [
      getUrl("dark-forest-1x"),
      getUrl("dark-forest-2x"),
      getUrl("dark-forest-4x"),
    ],
    thumb: getUrl("dark-forest-thumb"),
    Cmp: ImageBg,
  },
  {
    key: "temple",
    src: [getUrl("temple-1x"), getUrl("temple-2x"), getUrl("temple-4x")],
    thumb: getUrl("temple-thumb"),
    Cmp: ImageBg,
  },
  {
    key: "trail",
    src: [getUrl("trail-1x"), getUrl("trail-2x"), getUrl("trail-4x")],
    thumb: getUrl("trail-thumb"),
    Cmp: ImageBg,
  },
  {
    key: "view",
    src: [getUrl("view-1x"), getUrl("view-2x"), getUrl("view-4x")],
    thumb: getUrl("view-thumb"),
    Cmp: ImageBg,
  },
  {
    key: "dark",
    src: [
      getUrl("dark-coin-1x"),
      getUrl("dark-coin-2x"),
      getUrl("dark-coin-4x"),
    ],
    thumb: getUrl("dark-coin-thumb"),
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
    src: [getUrl("gold-1x"), getUrl("gold-2x"), getUrl("gold-4x")],
    thumb: getUrl("gold-coin-thumb"),
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
            <bgRef.value.Cmp key={srcRef.value} src={srcRef} bg={bgRef} />
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
