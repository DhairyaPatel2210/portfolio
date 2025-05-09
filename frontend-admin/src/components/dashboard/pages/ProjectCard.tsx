import { useState, useEffect } from "react";
import { Project, ProjectType } from "@/lib/types/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X, Calendar as CalendarIcon } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import rehypeSanitize from "rehype-sanitize";

interface ProjectCardProps {
  project?: Project;
  isNew?: boolean;
  onSave: (project: Project) => void;
  onDelete?: () => void;
  onCancel?: () => void;
}

function ProjectCard({
  project,
  isNew,
  onSave,
  onDelete,
  onCancel,
}: ProjectCardProps) {
  const { toast } = useToast();
  const initialFormData: Project = {
    title: "",
    description: "",
    programmingLanguages: [],
    githubRepo: "",
    liveWebLink: "",
    projectType: [],
    iconImage: "",
    specialNote: "",
    startDate: new Date(),
    currentlyWorking: false,
    endDate: undefined,
  };

  const [formData, setFormData] = useState<Project>(project || initialFormData);

  const [newLanguage, setNewLanguage] = useState("");
  const [newProjectType, setNewProjectType] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (formData.iconImage) {
      setImagePreview(formData.iconImage);
    }
  }, [formData.iconImage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.projectType.length === 0) {
      return;
    }
    onSave(formData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({ ...prev, iconImage: base64String }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, iconImage: "" }));
    setImagePreview(null);
  };

  const addLanguage = () => {
    if (newLanguage && !formData.programmingLanguages?.includes(newLanguage)) {
      setFormData({
        ...formData,
        programmingLanguages: [
          ...(formData.programmingLanguages || []),
          newLanguage,
        ],
      });
      setNewLanguage("");
    }
  };

  const removeLanguage = (lang: string) => {
    setFormData({
      ...formData,
      programmingLanguages: (formData.programmingLanguages || []).filter(
        (l) => l !== lang
      ),
    });
  };

  const addProjectType = () => {
    const type = newProjectType.trim();
    if (type && !formData.projectType?.includes(type)) {
      setFormData((prev) => ({
        ...prev,
        projectType: [...(prev.projectType || []), type],
      }));
      setNewProjectType("");
      toast({
        title: "Success",
        description: `Added project type: ${type}`,
      });
    } else if (formData.projectType?.includes(type)) {
      toast({
        title: "Error",
        description: "This project type already exists",
        variant: "destructive",
      });
    }
  };

  const removeProjectType = (type: string) => {
    setFormData({
      ...formData,
      projectType: (formData.projectType || []).filter((t) => t !== type),
    });
    toast({
      description: `Removed project type: ${type}`,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <h3 className="text-lg font-semibold">
          {isNew ? "New Project" : "Edit Project"}
        </h3>
        {onDelete && (
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title*</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="githubRepo">GitHub Repository*</Label>
              <Input
                id="githubRepo"
                value={formData.githubRepo}
                onChange={(e) =>
                  setFormData({ ...formData, githubRepo: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="liveWebLink">Live Web Link</Label>
              <Input
                id="liveWebLink"
                value={formData.liveWebLink}
                onChange={(e) =>
                  setFormData({ ...formData, liveWebLink: e.target.value })
                }
                placeholder="https://"
              />
            </div>

            <div className="space-y-2">
              <Label>Project Type*</Label>
              <div className="flex gap-2 flex-wrap mb-2">
                {(formData.projectType || []).map((type) => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className="flex gap-1 items-center"
                  >
                    {type}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeProjectType(type)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newProjectType}
                  onChange={(e) => setNewProjectType(e.target.value)}
                  placeholder="Type and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addProjectType();
                    }
                  }}
                />
              </div>
              {(!formData.projectType || formData.projectType.length === 0) && (
                <p className="text-sm text-red-500">
                  Please add at least one project type
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description*</Label>
            <div data-color-mode="light" className="markdown-editor">
              <MDEditor
                value={formData.description}
                onChange={(value) =>
                  setFormData({ ...formData, description: value || "" })
                }
                preview="edit"
                height={200}
                previewOptions={{
                  rehypePlugins: [rehypeSanitize],
                  components: {
                    ul: ({ children }) => (
                      <ul className="list-disc pl-4 my-2">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-4 my-2">{children}</ol>
                    ),
                    li: ({ children }) => <li className="my-1">{children}</li>,
                  },
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Programming Languages*</Label>
            <div className="flex gap-2 flex-wrap">
              {(formData.programmingLanguages || []).map((lang) => (
                <Badge
                  key={lang}
                  variant="secondary"
                  className="flex gap-1 items-center"
                >
                  {lang}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeLanguage(lang)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="Add language"
              />
              <Button type="button" onClick={addLanguage}>
                Add
              </Button>
            </div>
          </div>

          {/* Icon Image Upload */}
          <div className="space-y-2">
            <Label>Project Icon*</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              required={!imagePreview}
            />
            {imagePreview && (
              <div className="relative w-24 h-24 mt-2">
                <img
                  src={imagePreview}
                  alt="Project icon"
                  className="w-full h-full object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Special Note */}
          <div className="space-y-2">
            <Label>Special Note</Label>
            <div data-color-mode="light" className="markdown-editor">
              <MDEditor
                value={formData.specialNote}
                onChange={(value) =>
                  setFormData({ ...formData, specialNote: value || "" })
                }
                preview="edit"
                height={150}
                previewOptions={{
                  rehypePlugins: [rehypeSanitize],
                  components: {
                    ul: ({ children }) => (
                      <ul className="list-disc pl-4 my-2">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-4 my-2">{children}</ol>
                    ),
                    li: ({ children }) => <li className="my-1">{children}</li>,
                  },
                }}
              />
            </div>
          </div>

          {/* Dates and Currently Working */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date*</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate
                      ? format(formData.startDate, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) =>
                      date && setFormData({ ...formData, startDate: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="currentlyWorking"
                  checked={formData.currentlyWorking}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      currentlyWorking: checked as boolean,
                      endDate: checked ? undefined : formData.endDate,
                    })
                  }
                />
                <Label htmlFor="currentlyWorking">Currently Working</Label>
              </div>

              {!formData.currentlyWorking && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate
                        ? format(formData.endDate, "PPP")
                        : "Pick end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) =>
                        date && setFormData({ ...formData, endDate: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">
              {isNew ? "Create Project" : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default ProjectCard;
