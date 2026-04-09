import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import "./index.css";
import { Provider } from "react-redux";
import { persistor, store } from "./store/store.js";
import { CallProvider } from "./context/CallContext.jsx";
import { ChatProvider } from "./context/chatContext.jsx";
import { LiveStreamProvider } from "./context/LiveStreamContext.jsx";
import { PersistGate } from "redux-persist/integration/react";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
      <CallProvider>
        <ChatProvider>
          <LiveStreamProvider>
          <Toaster
            position="top-right"
            reverseOrder={false}
            containerStyle={{ zIndex: 99999 }}
            toastOptions={{
              style: {
                fontFamily: "Poppins",
                fontSize: "14px",
              },
            }}
          />
          <App />
          </LiveStreamProvider>
        </ChatProvider>
      </CallProvider>
    </PersistGate>
  </Provider>,
);
