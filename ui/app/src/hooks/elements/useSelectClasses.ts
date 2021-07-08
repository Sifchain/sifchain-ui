import cx from "clsx";

export const useSelectClasses = () => {
  return {
    label: "text-white",
    container:
      "mt-[10px] h-[54px] px-3 flex items-center justify-between relative w-full text-lg bg-gray-input border border-solid border-gray-input_outline rounded",
    select: "opacity-0 absolute left-0 h-full w-full",
  };
};
