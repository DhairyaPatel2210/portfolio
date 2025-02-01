import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Trash2 } from "lucide-react";
import { Experience } from "@/lib/types/experience";
import MDEditor from "@uiw/react-md-editor";
import { useFormik } from "formik";
import { experienceSchema } from "@/lib/validations/experience";
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
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import rehypeSanitize from "rehype-sanitize";
import api from "@/lib/axios";

function ExperiencePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(
    null
  );
  const [newTechnology, setNewTechnology] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/experiences");
      console.log("Fetched experiences:", data);
      setExperiences(data || []);
    } catch (error) {
      toast.error("Failed to load experiences");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/experiences/${id}`);
      setExperiences(experiences.filter((exp) => exp._id !== id));
      toast.success("Experience deleted successfully");
    } catch (error) {
      toast.error("Failed to delete experience");
    }
    setDeleteId(null);
  };

  const createEmptyExperience = (): Experience => ({
    role: "",
    company: "",
    startDate: "",
    endDate: "",
    isCurrentJob: false,
    responsibilities: "",
    technologies: [],
  });

  const handleFormSubmit = async (values: Experience, { resetForm }: any) => {
    try {
      const isNew = !values._id;
      const { data } = await api({
        method: isNew ? "POST" : "PUT",
        url: isNew ? "/experiences" : `/experiences/${values._id}`,
        data: values,
      });

      // Extract the experience data from the response
      const experienceData = data.experience || data;

      if (isNew) {
        setExperiences([experienceData, ...experiences]);
      } else {
        setExperiences(
          experiences.map((exp) =>
            exp._id === experienceData._id ? experienceData : exp
          )
        );
      }

      setEditingExperience(null);
      resetForm();
      toast.success("Experience saved successfully");
    } catch (error) {
      toast.error("Failed to save experience");
    }
  };

  const formik = useFormik({
    initialValues: editingExperience || createEmptyExperience(),
    validationSchema: experienceSchema,
    onSubmit: handleFormSubmit,
    enableReinitialize: true,
  });

  const formatDateForDisplay = (dateString: string | undefined) => {
    if (!dateString) return "";
    return format(parseISO(dateString), "PPP");
  };

  const formatDateForAPI = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };

  const getFieldValue = (exp: Experience, field: keyof Experience) => {
    if (editingExperience && editingExperience._id === exp._id) {
      return editingExperience[field];
    }
    if (field === "technologies" && !exp[field]) {
      return [];
    }
    return exp[field];
  };

  const handleStartEditing = (exp: Experience) => {
    if (editingExperience?._id !== exp._id) {
      setEditingExperience(exp);
    }
  };

  const renderExperienceForm = (exp: Experience | null, isNew = false) => (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor={isNew ? "role" : `role-${exp?._id}`}>Role</Label>
        <Input
          id={isNew ? "role" : `role-${exp?._id}`}
          {...formik.getFieldProps("role")}
          className={cn(
            formik.touched.role && formik.errors.role && "border-red-500"
          )}
        />
        {formik.touched.role && formik.errors.role && (
          <p className="text-sm text-red-500">{formik.errors.role}</p>
        )}
      </div>

      <div>
        <Label htmlFor={isNew ? "company" : `company-${exp?._id}`}>
          Company
        </Label>
        <Input
          id={isNew ? "company" : `company-${exp?._id}`}
          {...formik.getFieldProps("company")}
          className={cn(
            formik.touched.company && formik.errors.company && "border-red-500"
          )}
        />
        {formik.touched.company && formik.errors.company && (
          <p className="text-sm text-red-500">{formik.errors.company}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formik.values.startDate && "text-muted-foreground",
                  formik.touched.startDate &&
                    formik.errors.startDate &&
                    "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formik.values.startDate ? (
                  formatDateForDisplay(formik.values.startDate)
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={
                  formik.values.startDate
                    ? parseISO(formik.values.startDate)
                    : undefined
                }
                onSelect={(date) =>
                  formik.setFieldValue(
                    "startDate",
                    date ? formatDateForAPI(date) : ""
                  )
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {formik.touched.startDate && formik.errors.startDate && (
            <p className="text-sm text-red-500">{formik.errors.startDate}</p>
          )}
        </div>

        <div>
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formik.values.endDate && "text-muted-foreground",
                  formik.touched.endDate &&
                    formik.errors.endDate &&
                    "border-red-500"
                )}
                disabled={formik.values.isCurrentJob}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formik.values.endDate ? (
                  formatDateForDisplay(formik.values.endDate)
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={
                  formik.values.endDate
                    ? parseISO(formik.values.endDate)
                    : undefined
                }
                onSelect={(date) =>
                  formik.setFieldValue(
                    "endDate",
                    date ? formatDateForAPI(date) : ""
                  )
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {formik.touched.endDate && formik.errors.endDate && (
            <p className="text-sm text-red-500">{formik.errors.endDate}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id={isNew ? "isCurrentJob" : `isCurrentJob-${exp?._id}`}
          checked={formik.values.isCurrentJob}
          onCheckedChange={(checked) => {
            formik.setFieldValue("isCurrentJob", checked);
            if (checked) {
              formik.setFieldValue("endDate", "");
            }
          }}
        />
        <Label htmlFor={isNew ? "isCurrentJob" : `isCurrentJob-${exp?._id}`}>
          Current Job
        </Label>
      </div>

      <div>
        <Label>Responsibilities</Label>
        <div data-color-mode="light" className="markdown-editor">
          <MDEditor
            value={formik.values.responsibilities}
            onChange={(value) =>
              formik.setFieldValue("responsibilities", value || "")
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
        {formik.touched.responsibilities && formik.errors.responsibilities && (
          <p className="text-sm text-red-500">
            {formik.errors.responsibilities}
          </p>
        )}
      </div>

      <div>
        <Label>Technologies</Label>
        <Input
          value={newTechnology}
          onChange={(e) => setNewTechnology(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newTechnology.trim()) {
              e.preventDefault();
              if (!formik.values.technologies.includes(newTechnology.trim())) {
                formik.setFieldValue("technologies", [
                  ...formik.values.technologies,
                  newTechnology.trim(),
                ]);
              }
              setNewTechnology("");
            }
          }}
          placeholder="Type and press Enter to add"
          className="mb-2"
        />
        <div className="flex flex-wrap gap-2">
          {formik.values.technologies.map((tech) => (
            <Badge key={tech} variant="secondary" className="px-2 py-1">
              {tech}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() =>
                  formik.setFieldValue(
                    "technologies",
                    formik.values.technologies.filter((t) => t !== tech)
                  )
                }
              />
            </Badge>
          ))}
        </div>
        {formik.touched.technologies && formik.errors.technologies && (
          <p className="text-sm text-red-500">{formik.errors.technologies}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setEditingExperience(null);
            formik.resetForm();
          }}
        >
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );

  if (isLoading) {
    return <div className="text-center py-4">Loading experiences...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Experience</h1>
        <Button
          onClick={() => setEditingExperience(createEmptyExperience())}
          disabled={!!editingExperience}
        >
          Add Experience
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {editingExperience && !editingExperience._id && (
          <Card className="relative">
            <CardContent className="pt-6">
              {renderExperienceForm(editingExperience, true)}
            </CardContent>
          </Card>
        )}

        {experiences.map((exp) => (
          <Card key={exp._id} className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 hover:bg-destructive hover:text-destructive-foreground z-10"
              onClick={() => setDeleteId(exp._id || null)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <CardContent className="pt-6">
              {editingExperience?._id === exp._id ? (
                renderExperienceForm(exp)
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label>Role</Label>
                    <p className="text-lg font-medium">{exp.role}</p>
                  </div>
                  <div>
                    <Label>Company</Label>
                    <p className="text-gray-600">{exp.company}</p>
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <p className="text-sm text-gray-500">
                      {formatDateForDisplay(exp.startDate)} -{" "}
                      {exp.isCurrentJob
                        ? "Present"
                        : formatDateForDisplay(exp.endDate)}
                    </p>
                  </div>
                  <div>
                    <Label>Responsibilities</Label>
                    <div className="mt-2 markdown-preview">
                      <MDEditor.Markdown
                        source={exp.responsibilities}
                        components={{
                          ul: ({ children }) => (
                            <ul className="list-disc pl-4 my-2">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-4 my-2">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="my-1">{children}</li>
                          ),
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Technologies</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {exp.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => setEditingExperience(exp)}>
                      Edit
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              experience.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ExperiencePage;
