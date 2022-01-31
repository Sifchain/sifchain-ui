import clsx from "clsx";

type Props = {
  pages: number;
  pageIndex: number;
  onPageIndexChange: (pageIndex: number) => void;
};

export default function Pagination(props: Props) {
  return (
    <div class="flex items-center gap-2 pt-4 pb-6 justify-center">
      <button
        class="outline outline-1 w-6 h-6 grid place-items-center hover:text-accent-muted"
        onClick={() => {
          if (props.pageIndex) {
            props.onPageIndexChange(props.pageIndex - 1);
          }
        }}
      >
        «
      </button>
      {new Array(props.pages).fill(0).map((_, idx) => (
        <button
          class={clsx(
            "outline outline-1 w-6 h-6 grid place-items-center hover:text-accent-muted",
            {
              "outline-accent-base text-accent-base font-semibold":
                idx === props.pageIndex,
            },
          )}
          onClick={props.onPageIndexChange.bind(null, idx)}
        >
          {idx + 1}
        </button>
      ))}
      <button
        class="outline outline-1 w-6 h-6 grid place-items-center hover:text-accent-muted"
        onClick={() => {
          if (props.pageIndex < props.pages - 1) {
            props.onPageIndexChange(props.pageIndex + 1);
          }
        }}
      >
        »
      </button>
    </div>
  );
}
