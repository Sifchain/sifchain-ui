// could switch the height for smaller buttons, the rest is about the same..
export const useButtonClasses = () => {
  return {
    button:
      "h-[62px] rounded-[4px] bg-accent-gradient flex items-center justify-center font-sans text-[18px] font-semibold text-white",
    disabled: "opacity-50 text-gray-disabled",
  };
};
