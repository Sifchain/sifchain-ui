export type PositionColumnId = "asset" | "side" | "size" | "pnl" | "actions";
export type PositionColumn = {
  id: PositionColumnId;
  name: string;
  class: string;
  help?: string;
};
export const POSITION_COLUMNS: PositionColumn[] = [
  {
    id: "asset",
    name: "Asset",
    class: "w-[150px] text-right",
  },
  {
    id: "side",
    name: "Side",
    class: "w-[150px] text-right",
  },
  {
    id: "size",
    name: "Position Size",
    class: "w-[150px] text-right",
  },
  {
    id: "pnl",
    name: "PnL",
    class: "w-[150px] text-right",
  },
  {
    id: "actions",
    name: "",
    class: "w-[100px] text-right",
  },
];
export const POSITION_COLUMNS_BY_ID = POSITION_COLUMNS.reduce(
  (acc, curr) => ({ ...acc, [curr.id]: curr }),
  {} as Record<PositionColumnId, PositionColumn>,
);
