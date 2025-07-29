import React, { createContext, useContext, useState } from "react";

const ViewsContext = createContext();

export const ViewsProvider = ({ children }) => {
  const [showViews, setShowViews] = useState(false);

  return (
    <ViewsContext.Provider value={{ showViews, setShowViews }}>
      {children}
    </ViewsContext.Provider>
  );
};

export const useViews = () => useContext(ViewsContext);