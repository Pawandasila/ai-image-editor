import { createContext, useContext } from "react";

export const CanvasContext = createContext();

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("Error");
  }
  return context;
};
