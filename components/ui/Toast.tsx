// Toast UI + logic lives in providers/ToastProvider.tsx (ToastProvider + useToast),
// mounted once at the app root. Re-exported here so it's discoverable alongside
// the rest of the component library.
export { ToastProvider, useToast } from "@/providers/ToastProvider";
export type { ToastItem, ToastVariant } from "@/providers/ToastProvider";
