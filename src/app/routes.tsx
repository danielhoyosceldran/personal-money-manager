import { createBrowserRouter } from "react-router";
import { MainLayout } from "./layouts/MainLayout";
import { Transactions } from "./pages/Transactions";
import { Stats } from "./pages/Stats";
import { Settings } from "./pages/Settings";
import { Accounts } from "./pages/Accounts";
import { AddTransaction } from "./pages/AddTransaction";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Transactions },
      { path: "stats", Component: Stats },
      { path: "accounts", Component: Accounts },
      { path: "settings", Component: Settings },
    ],
  },
  {
    path: "/add",
    Component: AddTransaction,
  },
]);
