import React, { useEffect, useRef } from "react";
import "./App.scss";
import ErrorBoundary from "./components/error-boundary";
import RoutingConfig from "./routing";
import { PrimeReactProvider } from "primereact/api";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { setToastRef } from "./services/toaster-service";

type Props = {};

const App: React.FC<Props> = ({}: Props) => {
  const toast = useRef<Toast>(null);

  useEffect(() => {
    setToastRef(toast as React.RefObject<Toast>);
  }, []);

  return (
    <>
      <PrimeReactProvider>
        <ErrorBoundary>
          <Toast ref={toast} position="top-right" />
          <ConfirmDialog />
          <RoutingConfig />
        </ErrorBoundary>
      </PrimeReactProvider>
    </>
  );
};

export default App;
