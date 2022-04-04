export default function AdvancedProgressRing(props: {
  size: number;
  progress: number;
  class?: string;
  ringWidth?: number;
}) {
  const ringWidth = props.ringWidth || Math.ceil(props.size / 7);
  const sizeStyle = { width: props.size + "px", height: props.size + "px" };
  return (
    <div class={[`relative`, props.class]} style={sizeStyle}>
      <div class="text-gray-input absolute left-0 top-0" style={sizeStyle}>
        {/* Background ring: faded color, full circle */}
        <BasicProgressRing
          radius={props.size / 2}
          progress={100}
          ringWidth={ringWidth}
        />
      </div>
      <div class="absolute left-0 top-0 text-gray-600" style={sizeStyle}>
        {/* Foreground ring: not faded, marks progress */}
        <BasicProgressRing
          radius={props.size / 2}
          progress={props.progress}
          ringWidth={ringWidth}
        />
      </div>
    </div>
  );
}

export function BasicProgressRing(props: {
  radius: number;
  progress: number;
  ringWidth: number;
}) {
  const r = props.radius - props.ringWidth * 2;
  const circumference = r * 2 * Math.PI;

  return (
    <svg width={props.radius * 2 + "px"} height={props.radius * 2 + "px"}>
      <circle
        style={{
          transition: "0.2s stroke-dashoffset",
          transform: "rotate(-90deg)",
          transformOrigin: "50% 50%",
          strokeDasharray: `${circumference} ${circumference}`,
          strokeDashoffset: `${(1 - props.progress / 100) * circumference}`,
        }}
        stroke="currentColor"
        stroke-width={props.ringWidth}
        fill="transparent"
        r={r}
        cx={props.radius}
        cy={props.radius}
      />
    </svg>
  );
}
