import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "@/lib/store/features/authSlice";
import api from "@/lib/axios";
import { useToast } from "@/components/ui/use-toast";

const sidebarItems = [
  { name: "Home", path: "/dashboard/home" },
  { name: "Projects", path: "/dashboard/projects" },
  { name: "Interests", path: "/dashboard/interests" },
  { name: "Resume", path: "/dashboard/resumes" },
  { name: "Experience", path: "/dashboard/experiences" },
  { name: "Education", path: "/dashboard/educations" },
  { name: "Status", path: "/dashboard/status" },
  { name: "About Me", path: "/dashboard/about" },
  { name: "Socials", path: "/dashboard/socials" },
  { name: "SEO", path: "/dashboard/seo" },
  { name: "Analytics", path: "/dashboard/analytics" },
];

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");

      // Clear token from localStorage
      localStorage.removeItem("token");

      // Dispatch logout action
      dispatch(logout());

      navigate("/login");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to logout",
      });
    }
  };

  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r bg-gray-50/40 p-4">
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={cn("w-full justify-start text-left font-normal")}
              >
                {item.name}
              </Button>
            </Link>
          ))}
          <Button
            variant="destructive"
            className="w-full mt-4"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Dashboard;
