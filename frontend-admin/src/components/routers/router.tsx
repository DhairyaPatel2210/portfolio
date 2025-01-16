import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../dashboard/Dashboard";
import Projects from "../dashboard/pages/Projects";
import ProtectedRoute from "../auth/ProtectedRoute";
import Interests from "../dashboard/pages/Interests";
import Resumes from "../dashboard/pages/Resumes";
import Socials from "../dashboard/pages/Socials";
import AboutMe from "../dashboard/pages/AboutMe";
import Status from "../dashboard/pages/Status";
import Experience from "../dashboard/pages/Experience";
import Education from "../dashboard/pages/Education";
import Home from "../dashboard/pages/Home";
import SEO from "../dashboard/pages/SEO";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="projects" element={<Projects />} />
          <Route path="interests" element={<Interests />} />
          <Route path="resumes" element={<Resumes />} />
          <Route path="socials" element={<Socials />} />
          <Route path="about" element={<AboutMe />} />
          <Route path="status" element={<Status />} />
          <Route path="experiences" element={<Experience />} />
          <Route path="educations" element={<Education />} />
          <Route path="seo" element={<SEO />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
