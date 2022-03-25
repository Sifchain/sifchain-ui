import { SetupContext } from "vue";
import { Tippy, TippyOptions } from "vue-tippy";

// This is not a complete type declaration; add more props
// if you need to use them.
// It's from tippy.js instance
export type TooltipInstance = {
  id: number;
  popper: HTMLElement;
  hide: () => void;
};

export type TooltipProps = TippyOptions;

export default Tippy;

export const Tooltip = Tippy as unknown as (
  props: TooltipProps,
  context: SetupContext,
) => JSX.Element;
