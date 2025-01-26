import React, { createContext, useContext, useState, ReactNode } from "react";
import { Client } from "./types";

interface GlobalStateContextType {
  customerData: any;
  setCustomerData: (data: any) => void;
  statuses: any;
  setStatuses: (data: any) => void;
}

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(
  undefined
);

export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  const [customerData, setCustomerData] = useState<Client>([]);
  const [statuses, setStatuses] = useState<any>([]);

  return (
    <GlobalStateContext.Provider
      value={{ customerData, setCustomerData, statuses, setStatuses }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
};
