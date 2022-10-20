import { SetupContext } from "vue";
import clsx from "clsx";

import { prettyNumber } from "~/utils/prettyNumber";
import { Button } from "~/components/Button/Button";
import { Input } from "~/components/Input/Input";
import PageCard from "~/components/PageCard";

const formatNumber = (number: number) =>
  number >= 100 ** 10
    ? Intl.NumberFormat("en", {
        notation: "compact",
      }).format(number)
    : prettyNumber(number);

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

function isValidNumericString(
  numericString: string,
  max = Number.MAX_SAFE_INTEGER,
  min = 0,
) {
  const asFloat = parseFloat(numericString);

  return !isNaN(asFloat) && asFloat <= max && asFloat >= min;
}

export const RewardsCalculator = (props: Props) => {
  const potentialReturnRate = props.potentialReturn
    ? props.potentialReturn / props.investment
    : 0;

  return (
    <PageCard heading="Rewards Calculator" iconName="navigation/pool-stats">
      <section class="grid w-full gap-4 overflow-x-clip pb-4">
        <p class="text-gray-850">Estimate your returns</p>
        <header class="grid gap-1">
          <div class="grid grid-cols-2 gap-4 rounded-lg">
            <HeaderInfoItem
              title={`${props.tokenOutSymbol} Price`}
              value={
                props.tokenOutPrice !== "0"
                  ? `$${prettyNumber(parseFloat(props.tokenOutPrice), 5)}`
                  : "..."
              }
            />
            <HeaderInfoItem
              title={`Your ${props.tokenInSymbol} Balance`}
              value={prettyNumber(parseFloat(props.tokenInBalance))}
            />
          </div>
        </header>
        <main class="grid gap-4">
          <div class="grid gap-4 md:grid-cols-2 md:grid-rows-2">
            <InputLabel label={`${props.tokenInSymbol} Amount`}>
              <Input.Base
                placeholder={"0"}
                class="overflow-hidden text-right"
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
                  if (!props.onTokenInAmountChange) {
                    return;
                  }

                  const { value } = e.target as HTMLInputElement;

                  if (isValidNumericString(value)) {
                    props.onTokenInAmountChange(value);
                  } else {
                    props.onTokenInAmountChange("0");
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
                max="3000000"
                value={props.apr}
                startContent={
                  props.onResetAPR && (
                    <Button.Pill onClick={props.onResetAPR}>RESET</Button.Pill>
                  )
                }
                onInput={(e) => {
                  if (!props.onAPRChange) {
                    return;
                  }

                  const { value } = e.target as HTMLInputElement;

                  if (isValidNumericString(value, 999999999)) {
                    props.onAPRChange(value);
                  } else if (props.onResetAPR) {
                    props.onResetAPR();
                  } else {
                    props.onAPRChange("0");
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
                  if (!props.onTokenOutPriceAtPurchaseChange) {
                    return;
                  }

                  const { value } = e.target as HTMLInputElement;

                  if (isValidNumericString(value)) {
                    props.onTokenOutPriceAtPurchaseChange(value);
                  } else if (props.onResetTokenOutPriceAtPurchase) {
                    props.onResetTokenOutPriceAtPurchase();
                  } else {
                    props.onTokenOutPriceAtPurchaseChange("0");
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
                  if (!props.onTokenOutFuturePriceChange) {
                    return;
                  }

                  const { value } = e.target as HTMLInputElement;
                  if (isValidNumericString(value)) {
                    props.onTokenOutFuturePriceChange(value);
                  } else if (props.onResetTokenOutFuturePrice) {
                    props.onResetTokenOutFuturePrice();
                  } else {
                    props.onTokenOutFuturePriceChange("0");
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
                if (!props.onTimeInWeeksChage) {
                  return;
                }

                const { value } = e.target as HTMLInputElement;

                const asFloat = parseFloat(value);

                if (isValidNumericString(value, 100)) {
                  props.onTimeInWeeksChage(asFloat);
                } else {
                  props.onTimeInWeeksChage(12);
                }
              }}
            />
          </InputLabel>
        </main>
        <footer class="grid gap-1">
          <FooterInfoItem
            title="Your initial investment"
            value={`$${formatNumber(props.investment)}`}
          />
          <FooterInfoItem
            title="Current wealth"
            value={`$${formatNumber(props.currentWealth)}`}
          />
          <FooterInfoItem
            title={`${props.tokenOutSymbol} rewards estimation`}
            value={`${formatNumber(props.rewardsEstimate)} ${
              props.tokenOutSymbol
            }`}
          />
          <FooterInfoItem
            highlight
            title="Potential return"
            value={`$${formatNumber(props.potentialReturn)} ${
              potentialReturnRate
                ? `(${formatNumber(potentialReturnRate)}x)`
                : ""
            }`}
          />
        </footer>
      </section>
    </PageCard>
  );
};

const HeaderInfoItem = (props: { title: string; value: string }) => (
  <div class={"bg-gray-input/80 grid flex-1 gap-1 rounded-lg p-4 text-center"}>
    <div class="text-md text-accent-base font-semibold">{props.title}</div>
    <div class="text-xl font-bold">{props.value}</div>
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
        "text-accent-base text-right text-lg font-bold": props.highlight,
      })}
    >
      {props.value}
    </div>
  </div>
);

const InputLabel = (props: { label: string }, ctx: SetupContext) => (
  <label class="grid gap-1 text-base">
    {props.label}
    {ctx.slots.default && ctx.slots.default()}
  </label>
);
