import { Toast } from "primereact/toast";
import type { RefObject } from "react";

let toastRef: RefObject<Toast> | null = null;

export const setToastRef = (ref: RefObject<Toast>) => {
  toastRef = ref;
};

export const showToast = (
  severity: "success" | "info" | "warn" | "error",
  summary: string,
  detail: string,
  life = 3000
) => {
  toastRef?.current?.show({ severity, summary, detail, life });
};
