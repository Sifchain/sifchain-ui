import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { FancyLoadingSpinner } from "./FancySpinner";

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
      <div class="absolute left-0 top-0 text-gray-input" style={sizeStyle}>
        {/* Background ring: faded color, full circle */}
        {/* <BasicProgressRing
          radius={props.size / 2}
          progress={100}
          ringWidth={ringWidth}
        /> */}
        <FancyLoadingSpinner></FancyLoadingSpinner>
      </div>
      <div class="absolute left-0 top-0 text-gray-600" style={sizeStyle}>
        {/* Foreground ring: not faded, marks progress */}
        {/* <BasicProgressRing
          radius={props.size / 2}
          progress={props.progress}
          ringWidth={ringWidth}
        /> */}
        <FancyLoadingSpinner></FancyLoadingSpinner>
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
// var circle = document.querySelector('circle');
// var radius = circle.r.baseVal.value;
// var circumference = radius * 2 * Math.PI;

// circle.style.strokeDasharray = `${circumference} ${circumference}`;
// circle.style.strokeDashoffset = `${circumference}`;

// function setProgress(percent) {
//   const offset = circumference - percent / 100 * circumference;
//   circle.style.strokeDashoffset = offset;
// }

// const input = document.querySelector('input');
// setProgress(input.value);

// input.addEventListener('change', function(e) {
//   if (input.value < 101 && input.value > -1) {
//     setProgress(input.value);
//   }
// })
