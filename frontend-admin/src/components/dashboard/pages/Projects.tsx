import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Project } from "@/lib/types/project";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ProjectCard from "./ProjectCard";

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState<boolean>(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();
      console.log(data);
      setProjects(data);
    } catch (error) {
      toast.error("Failed to load projects");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        toast.error("Remove from featured section");
        return;
      }

      toast.success("Project deleted successfully");
      setProjects(projects.filter((p) => p._id !== id));
    } catch (error) {
      toast.error("Failed to delete project");
    }
    setDeleteProjectId(null);
  };

  const handleSave = async (project: Project) => {
    try {
      const isNew = !project._id;
      const response = await fetch(
        isNew ? "/api/projects" : `/api/projects/${project._id}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(project),
        }
      );

      if (!response.ok) throw new Error("Failed to save project");

      const savedProject = await response.json();

      if (isNew) {
        setProjects((prevProjects) => [savedProject, ...prevProjects]);
        setNewProject(false);
        await fetchProjects();
      } else {
        setProjects((prevProjects) =>
          prevProjects.map((p) =>
            p._id === savedProject._id ? savedProject : p
          )
        );
      }

      toast.success(`Project ${isNew ? "created" : "updated"} successfully`);
    } catch (error) {
      toast.error("Failed to save project");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <Button onClick={() => setNewProject(true)}>Add New Project</Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {newProject && (
          <ProjectCard
            isNew
            onSave={handleSave}
            onCancel={() => setNewProject(false)}
          />
        )}

        {projects.map((project) => (
          <ProjectCard
            key={project._id}
            project={project}
            onSave={handleSave}
            onDelete={() => setDeleteProjectId(project._id!)}
          />
        ))}
      </div>

      <AlertDialog
        open={!!deleteProjectId}
        onOpenChange={() => setDeleteProjectId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProjectId && handleDelete(deleteProjectId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Projects;
