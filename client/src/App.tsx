import { ToastProvider } from "./context/ToastContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}

export default App;