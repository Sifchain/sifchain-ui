export type INotification = {
  id?: string; // id would be used to remove timeout, may only need to be local type
  type: "error" | "success" | "info";
  message: string;
  loader?: boolean;
  manualClose?: boolean;
  key?: string;
  onAction?: () => void;
};
