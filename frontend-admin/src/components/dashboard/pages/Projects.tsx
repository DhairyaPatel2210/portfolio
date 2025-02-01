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
import api from "@/lib/axios";

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState<boolean>(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/projects");
      setProjects(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load projects");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/projects/${id}`);
      toast.success("Project deleted successfully");
      setProjects(projects.filter((p) => p._id !== id));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete project");
    }
    setDeleteProjectId(null);
  };

  const handleSave = async (project: Project) => {
    try {
      const isNew = !project._id;
      const { data } = await api[isNew ? "post" : "put"](
        isNew ? "/projects" : `/projects/${project._id}`,
        project
      );

      if (isNew) {
        setProjects((prevProjects) => [data, ...prevProjects]);
        setNewProject(false);
        await fetchProjects();
      } else {
        setProjects((prevProjects) =>
          prevProjects.map((p) => (p._id === data._id ? data : p))
        );
      }

      toast.success(`Project ${isNew ? "created" : "updated"} successfully`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save project");
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
