import BaseNotification from "./BaseNotification.svelte";
import toast, { type Renderable, type ToastPosition } from "@leodog896/svelte-french-toast";

type NotificationProps = {
  content: Renderable;
  status: "success" | "info" | "loading" | "error" | "warning";
  duration?: number;
  icon?: string;
  position?: ToastPosition;
  props?: Record<string, any>;
};

type NotificationOptions = {
  duration?: number;
  icon?: string;
  position?: ToastPosition;
  props?: Record<string, any>;
};

const DEFAULT_DURATION = 3000;
const DEFAULT_POSITION: ToastPosition = "top-center";

const Notification = ({
  content,
  status,
  duration = DEFAULT_DURATION,
  icon,
  position = DEFAULT_POSITION,
  props,
}: NotificationProps) => {
  return toast.custom(BaseNotification, {
    duration: status === "loading" ? Infinity : duration,
    position,
    props: { ...props, content, status },
    icon,
  });
};

export const notification = {
  success: (content: Renderable, options?: NotificationOptions) => {
    return Notification({ content, status: "success", ...options });
  },
  info: (content: Renderable, options?: NotificationOptions) => {
    return Notification({ content, status: "info", ...options });
  },
  warning: (content: Renderable, options?: NotificationOptions) => {
    return Notification({ content, status: "warning", ...options });
  },
  error: (content: Renderable, options?: NotificationOptions) => {
    return Notification({ content, status: "error", ...options });
  },
  loading: (content: Renderable, options?: NotificationOptions) => {
    return Notification({ content, status: "loading", ...options });
  },
  remove: (toastId: string) => {
    toast.remove(toastId);
  },
};
