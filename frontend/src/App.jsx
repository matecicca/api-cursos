import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Home from "./views/Home";
import Login from "./views/Login";
import Register from "./views/Register";
import Clases from "./views/Clases";
import Usuarios from "./views/Usuarios";
import Admin from "./views/Admin";
import MisClases from "./views/MisClases";
import NotFound from "./views/NotFound";
import { useAuth } from "./context/AuthContext";
import ApiDocs from "./views/ApiDocs";

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Login />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/usuarios" element={<PrivateRoute><Usuarios /></PrivateRoute>} />
          <Route path="/clases" element={<PrivateRoute><Clases /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
          <Route path="/mis-clases" element={<PrivateRoute><MisClases /></PrivateRoute>} />
          <Route path="/documentacion" element={<ApiDocs />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
