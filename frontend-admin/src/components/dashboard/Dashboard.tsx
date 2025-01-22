import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, Outlet, useNavigate } from "react-router-dom";

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

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
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
