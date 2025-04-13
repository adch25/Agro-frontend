import React from "react";
import { LoaderProvider } from "./LoaderContext";
import AlertMessage from "../components/AlertMessage";
import { AlertProvider } from "./AlertContext";
import { UserProvider } from "./UserContext";

export default function wrapContexts(props) {
  return (
    <>
      <UserProvider>
        <AlertProvider>
          <AlertMessage />
          <LoaderProvider>{props.children}</LoaderProvider>
        </AlertProvider>
      </UserProvider>
    </>
  );
}
