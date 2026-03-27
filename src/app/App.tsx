import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ToastProvider } from "../context/ToastContext";
import ToastContainer from "../components/ToastContainer";

export default function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
      <ToastContainer />
    </ToastProvider>
  );
}
