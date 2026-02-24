import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import "./index.css";
import { Provider } from "react-redux";
import { persistor, store } from "./store/store.js";
import { CallProvider } from "./context/CallContext.jsx";
import { ChatProvider } from "./context/chatContext.jsx";
import { PersistGate } from "redux-persist/integration/react";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
      <CallProvider>
        <ChatProvider>
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              style: {
                fontFamily: "Poppins",
                fontSize: "14px",
              },
            }}
          />
          <App />
        </ChatProvider>
      </CallProvider>
    </PersistGate>
  </Provider>,
);
