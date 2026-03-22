"use client";

import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { store } from "@/store";

export function AppProviders({ children }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster richColors closeButton position="top-center" />
    </Provider>
  );
}
