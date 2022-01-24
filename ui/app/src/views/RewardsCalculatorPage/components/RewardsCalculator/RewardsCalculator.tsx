import { SetupContext } from "vue";
import clsx from "clsx";

import { prettyNumber } from "@/utils/prettyNumber";
import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";
import PageCard from "@/components/PageCard";

type Props = {
  tokenInSymbol: string;
  tokenInBalance: string;
  tokenInAmount: string;
  tokenOutSymbol: string;
  tokenOutPrice: string;
  tokenOutFuturePrice: string;
  tokenOutPriceAtPurchase: string;
  currentAPR: string;
  apr: string;
  timeInWeeks: number;

  // computed
  investment: number;
  currentWealth: number;
  potentialReturn: number;
  rewardsEstimate: number;

  // callbacks
  onTokenInAmountChange?: (value: string) => void;
  onTimeInWeeksChage?: (value: number) => void;
  onApplyMaxBalance?: () => void;
  onAPRChange?: (value: string) => void;
  onResetAPR?: () => void;
  onTokenOutPriceAtPurchaseChange?: (value: string) => void;
  onResetTokenOutPriceAtPurchase?: () => void;
  onTokenOutFuturePriceChange?: (value: string) => void;
  onResetTokenOutFuturePrice?: () => void;
};

export const RewardsCalculator = (props: Props) => {
  return (
    <PageCard heading="Calculator">
      <section class="grid w-full gap-4 p-2 pb-4">
        <header class="grid gap-1">
          <span class="text-md">Estimate your returns</span>
          <div class="grid grid-cols-3 gap-2 p-4 bg-gray-input rounded-lg">
            <HeaderInfoItem
              title={`${props.tokenOutSymbol} Price`}
              value={
                props.tokenOutPrice !== "0"
                  ? `$${prettyNumber(parseFloat(props.tokenOutPrice), 5)}`
                  : "..."
              }
            />
            <HeaderInfoItem
              title="Current APR"
              value={`${props.currentAPR}%`}
            />
            <HeaderInfoItem
              title={`Your ${props.tokenInSymbol} Balance`}
              value={prettyNumber(parseFloat(props.tokenInBalance))}
            />
          </div>
        </header>
        <main class="grid gap-4">
          <div class="grid md:grid-cols-2 md:grid-rows-2 gap-4">
            <InputLabel label={`${props.tokenInSymbol} Amount`}>
              <Input.Base
                placeholder={"0"}
                class="text-right"
                type="number"
                min="0"
                value={props.tokenInAmount}
                startContent={
                  props.onApplyMaxBalance && (
                    <Button.Pill onClick={props.onApplyMaxBalance}>
                      MAX
                    </Button.Pill>
                  )
                }
                onInput={(e) => {
                  let v = (e.target as HTMLInputElement).value;
                  if (isNaN(parseFloat(v)) || parseFloat(v) < 0) {
                    v = "0";
                  }
                  if (props.onTokenInAmountChange) {
                    props.onTokenInAmountChange(v);
                  }
                }}
              />
            </InputLabel>
            <InputLabel label="APR (%)">
              <Input.Base
                class="text-right"
                placeholder="0"
                type="number"
                name="apr"
                min="0"
                value={props.apr}
                startContent={
                  props.onResetAPR && (
                    <Button.Pill onClick={props.onResetAPR}>RESET</Button.Pill>
                  )
                }
                onInput={(e) => {
                  if (props.onAPRChange) {
                    props.onAPRChange((e.target as HTMLInputElement).value);
                  }
                }}
              />
            </InputLabel>
            <InputLabel label={`${props.tokenOutSymbol} price at purchase ($)`}>
              <Input.Base
                class="text-right"
                placeholder="0"
                type="number"
                name="currentTokenOutPrice"
                min="0"
                value={props.tokenOutPriceAtPurchase}
                startContent={
                  props.onResetTokenOutPriceAtPurchase && (
                    <Button.Pill onClick={props.onResetTokenOutPriceAtPurchase}>
                      RESET
                    </Button.Pill>
                  )
                }
                onInput={(e) => {
                  if (props.onTokenOutPriceAtPurchaseChange) {
                    props.onTokenOutPriceAtPurchaseChange(
                      (e.target as HTMLInputElement).value,
                    );
                  }
                }}
              />
            </InputLabel>
            <InputLabel
              label={`Future ${props.tokenOutSymbol} market price ($)`}
            >
              <Input.Base
                class="text-right"
                placeholder="0"
                type="number"
                name="futureTokenOutPrice"
                min="0"
                value={props.tokenOutFuturePrice}
                startContent={
                  props.onResetTokenOutFuturePrice && (
                    <Button.Pill onClick={props.onResetTokenOutFuturePrice}>
                      RESET
                    </Button.Pill>
                  )
                }
                onInput={(e) => {
                  if (props.onTokenOutFuturePriceChange) {
                    props.onTokenOutFuturePriceChange(
                      (e.target as HTMLInputElement).value,
                    );
                  }
                }}
              />
            </InputLabel>
          </div>
          <InputLabel
            label={`${props.timeInWeeks} week${
              props.timeInWeeks > 1 ? "s" : ""
            }`}
          >
            <input
              type="range"
              min="1"
              max="100"
              value={props.timeInWeeks}
              onInput={(e) => {
                if (props.onTimeInWeeksChage) {
                  const value = Number((e.target as HTMLInputElement).value);
                  props.onTimeInWeeksChage(value);
                }
              }}
            />
          </InputLabel>
        </main>
        <footer class="grid gap-1">
          <FooterInfoItem
            title="Your initial investment"
            value={`$${prettyNumber(props.investment)}`}
          />
          <FooterInfoItem
            title="Current wealth"
            value={`$${prettyNumber(props.currentWealth)}`}
          />
          <FooterInfoItem
            title={`${props.tokenOutSymbol} rewards estimation`}
            value={`${prettyNumber(props.rewardsEstimate)} ${
              props.tokenOutSymbol
            }`}
          />
          <FooterInfoItem
            highlight
            title="Potential return"
            value={`$${prettyNumber(props.potentialReturn)} ${
              props.potentialReturn
                ? `(${(props.potentialReturn / props.investment).toFixed(2)}x)`
                : ""
            }`}
          />
        </footer>
      </section>
    </PageCard>
  );
};

const HeaderInfoItem = (props: { title: string; value: string }) => (
  <div class={"text-center grid gap-1"}>
    <div class="text-md">{props.title}</div>
    <div class="font-bold text-xl">{props.value}</div>
  </div>
);

const FooterInfoItem = (props: {
  title: string;
  value: string;
  highlight?: boolean;
}) => (
  <div class="flex justify-between">
    <div class="text-md">{props.title}</div>
    <div
      class={clsx({
        "text-accent-base font-bold text-lg": props.highlight,
      })}
    >
      {props.value}
    </div>
  </div>
);

const InputLabel = (props: { label: string }, ctx: SetupContext) => (
  <label class="grid gap-1 text-md">
    {props.label}
    {ctx.slots.default && ctx.slots.default()}
  </label>
);
