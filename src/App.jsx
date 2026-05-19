import reactLogo from "./assets/react.svg";
import "./App.css";
import "./styles/GlobalStyles.css";
import Header from "./components/Header";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import Preloader from "./components/Preloader";
import AdminOrders from "./components/AdminOrders";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import { AuthProvider } from "./components/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import ProjectPage from "./components/ProjectPage";

function App() {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsModelLoaded(true);
      console.log("Прелоадер разрешил показ контента :) ");
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log("Supabase client:", supabase);
  }, []);
  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .limit(1);

      if (error) {
        console.error("Supabase error:", error.message);
      } else {
        console.log("Supabase connected ✅", data);
      }
    };

    testConnection();
  }, []);

  return (
    <>
      <AuthProvider>
        <Preloader isModelLoaded={isModelLoaded} />
        <BrowserRouter>
          <Header />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />

            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <PrivateRoute adminOnly>
                  <AdminOrders />
                </PrivateRoute>
              }
            />

            <Route path="/project" element={<ProjectPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
