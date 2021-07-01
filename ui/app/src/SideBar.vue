<script lang="tsx">
import { defineComponent, PropType } from "vue";
import { IAssetAmount } from "@sifchain/sdk";

export default defineComponent({
  props: {},
  setup(props) {
    return () => (
      <div class="py-5 text-left font-sans flex-row align-center justify-center container w-1/6 h-full z-10 bg-white fixed left-0 top-0 bottom-0">
        <div class="px-8">
          <div class="block text-center w-3/4 mx-1/8 pt-2 mt-5">
            <img src={require("./assets/logo-lg.svg")} alt="" />
          </div>
          <div class="mt-20">
            {["Dashboard", "Swap", "Balances", "Pool", "Stake", "Docs ↗️"].map(
              (item) => {
                return (
                  <div
                    class="font-sans font-medium text-left text-lg mt-3"
                    key={item}
                  >
                    {item}
                  </div>
                );
              },
            )}
          </div>
          <div class="mt-24 flex justify-start items-start flex-col">
            <div class="text-xs py-1 border-2 border-solid border-black rounded-xl p-1 px-1 pl-2 pr-2 justify-start">
              TVL: $24,300,946
            </div>
            <div class="text-xs py-1 flex mt-2 border-2 align-middle whitespace-nowrap pr-2 border-solid border-black rounded-xl p-1 px-1 justify-start">
              <img
                class="inline w-4"
                src={require("@/assets/rowan-icon.png")}
                alt=""
              />
              <span class="ml-1"> ROWAN: $0.954423 </span>
            </div>
          </div>
          <div class="mt-24 flex justify-start items-start flex-col">
            {[
              "Newsletter",
              "Legal",
              "Roadmap",
              "Tuts",
              "Privacy",
              " ",
              "  ",
              "   ",
              "Social Media",
            ].map((item) => (
              <div class="font-sans font-medium text-left text-lg mt-3">
                <span class="ml-1">{{ item }}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
});
</script>

<style lang="scss" module></style>
