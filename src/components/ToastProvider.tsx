"use client";

import { createContext, ReactNode, useContext } from "react";
import { toast, ToastContainer, TypeOptions } from "react-toastify";
import "react-toastify/ReactToastify.css";

type ToastContextType = {
  toast: (message: string, type?: TypeOptions) => void;
  changesSaved: () => void;
};

const ToastContext = createContext(null as ToastContextType | null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("No toast context");

  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  function toastFn(message: string, type: TypeOptions = "default") {
    toast(message, {
      type,
    });
  }

  function changesSaved() {
    toast("Changes saved.", {
      type: "success",
    });
  }

  return (
    <ToastContext.Provider value={{ toast: toastFn, changesSaved }}>
      {children}
      <ToastContainer position="bottom-center" />
    </ToastContext.Provider>
  );
}
