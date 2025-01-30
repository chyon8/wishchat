export {};
declare global {
  interface Window {
    gtag: (
      command: "event" | "config" | "set",
      eventName: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      eventParams?: Record<string, any>
    ) => void;
  }
}
