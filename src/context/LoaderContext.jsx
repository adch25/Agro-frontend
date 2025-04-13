import React, { createContext, useContext, useState } from "react";

const LoaderContext = createContext();

export const useLoaderContext = () => useContext(LoaderContext);

export const LoaderProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoaderContext.Provider value={{ setIsLoading }}>
      {isLoading && (
        <div className="loader_container">
          <div className="loader"></div>
        </div>
      )}
      {children}
    </LoaderContext.Provider>
  );
};
