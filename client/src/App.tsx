import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import RootPage from "./Pages/RootPage";
import ClientsPage from "./Pages/ClientsPage";
import TrainersPage from "./Pages/TrainersPage";
import SportsPage from "./Pages/SportsPage";

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootPage />,
      children: [
        { index: true, element: <Navigate to="/clients" /> },
        { path: "clients", element: <ClientsPage /> },
        { path: "trainers", element: <TrainersPage /> },
        { path: "workout", element: <SportsPage /> },
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default App;
