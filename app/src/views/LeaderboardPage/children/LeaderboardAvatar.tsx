export function LeaderboardAvatar(props: {
  name: string;
  size: number;
  class?: string;
  style?: object;
}) {
  const innerSize = Math.round(props.size * 0.9333);
  return (
    <div
      class={[
        "translate-y-[1px] flex items-center justify-center rounded-full",
        props.class,
      ]}
      style={{
        background: "linear-gradient(180deg, #FADC7E 0%, #50400F 100%)",
        width: props.size + "px",
        height: props.size + "px",
        ...props.style,
      }}
    >
      <div
        class="flex items-center justify-center rounded-full font-noatan text-base font-thin whitespace-pre text-accent-light tracking-wide"
        style={{
          background: "linear-gradient(180deg, #DAAB16 0%, #A78A30 100%)",
          width: innerSize + "px",
          height: innerSize + "px",
          fontSize: innerSize / 2 + "px",
          textShadow: "0px 1px 1px rgba(0, 0, 0, 0.2)",
        }}
      >
        {props.name
          .split(" ")
          .slice(0, 2)
          .map((word: string) => word[0].toUpperCase())
          .join("")}
      </div>
    </div>
  );
}
