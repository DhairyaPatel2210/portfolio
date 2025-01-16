import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Trash2 } from "lucide-react";
import { Education } from "@/lib/types/education";
import { useFormik } from "formik";
import { educationSchema } from "@/lib/validations/education";
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

function EducationPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [educations, setEducations] = useState<Education[]>([]);
  const [editingEducation, setEditingEducation] = useState<Education | null>(
    null
  );
  const [newCoursework, setNewCoursework] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchEducations();
  }, []);

  const fetchEducations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/educations", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch educations");
      const data = await response.json();
      setEducations(data || []);
    } catch (error) {
      toast.error("Failed to load educations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/educations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete education");

      setEducations(educations.filter((edu) => edu._id !== id));
      toast.success("Education deleted successfully");
    } catch (error) {
      toast.error("Failed to delete education");
    }
    setDeleteId(null);
  };

  const createEmptyEducation = (): Education => ({
    universityName: "",
    major: "",
    degree: "",
    startDate: "",
    endDate: "",
    isPursuing: false,
    relatedCourseworks: [],
    gpa: "",
  });

  const handleFormSubmit = async (values: Education, { resetForm }: any) => {
    try {
      const isNew = !values._id;
      const response = await fetch(
        isNew ? "/api/educations" : `/api/educations/${values._id}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) throw new Error("Failed to save education");
      const savedEducation = await response.json();
      const educationData = savedEducation.education || savedEducation;

      if (isNew) {
        setEducations([educationData, ...educations]);
      } else {
        setEducations(
          educations.map((edu) =>
            edu._id === educationData._id ? educationData : edu
          )
        );
      }

      setEditingEducation(null);
      resetForm();
      toast.success("Education saved successfully");
    } catch (error) {
      toast.error("Failed to save education");
    }
  };

  const formik = useFormik({
    initialValues: editingEducation || createEmptyEducation(),
    validationSchema: educationSchema,
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

  const renderEducationForm = (edu: Education | null, isNew = false) => (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor={isNew ? "universityName" : `universityName-${edu?._id}`}
          >
            University Name
          </Label>
          <Input
            id={isNew ? "universityName" : `universityName-${edu?._id}`}
            {...formik.getFieldProps("universityName")}
            className={cn(
              formik.touched.universityName &&
                formik.errors.universityName &&
                "border-red-500"
            )}
          />
          {formik.touched.universityName && formik.errors.universityName && (
            <p className="text-sm text-red-500">
              {formik.errors.universityName}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor={isNew ? "degree" : `degree-${edu?._id}`}>
            Degree
          </Label>
          <Input
            id={isNew ? "degree" : `degree-${edu?._id}`}
            {...formik.getFieldProps("degree")}
            className={cn(
              formik.touched.degree && formik.errors.degree && "border-red-500"
            )}
          />
          {formik.touched.degree && formik.errors.degree && (
            <p className="text-sm text-red-500">{formik.errors.degree}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={isNew ? "major" : `major-${edu?._id}`}>Major</Label>
          <Input
            id={isNew ? "major" : `major-${edu?._id}`}
            {...formik.getFieldProps("major")}
            className={cn(
              formik.touched.major && formik.errors.major && "border-red-500"
            )}
          />
          {formik.touched.major && formik.errors.major && (
            <p className="text-sm text-red-500">{formik.errors.major}</p>
          )}
        </div>

        <div>
          <Label htmlFor={isNew ? "gpa" : `gpa-${edu?._id}`}>GPA</Label>
          <Input
            id={isNew ? "gpa" : `gpa-${edu?._id}`}
            {...formik.getFieldProps("gpa")}
            className={cn(
              formik.touched.gpa && formik.errors.gpa && "border-red-500"
            )}
          />
          {formik.touched.gpa && formik.errors.gpa && (
            <p className="text-sm text-red-500">{formik.errors.gpa}</p>
          )}
        </div>
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
                disabled={formik.values.isPursuing}
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
          id={isNew ? "isPursuing" : `isPursuing-${edu?._id}`}
          checked={formik.values.isPursuing}
          onCheckedChange={(checked) => {
            formik.setFieldValue("isPursuing", checked);
            if (checked) {
              formik.setFieldValue("endDate", "");
            }
          }}
        />
        <Label htmlFor={isNew ? "isPursuing" : `isPursuing-${edu?._id}`}>
          Currently Pursuing
        </Label>
      </div>

      <div>
        <Label>Related Courseworks</Label>
        <Input
          value={newCoursework}
          onChange={(e) => setNewCoursework(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newCoursework.trim()) {
              e.preventDefault();
              if (
                !formik.values.relatedCourseworks.includes(newCoursework.trim())
              ) {
                formik.setFieldValue("relatedCourseworks", [
                  ...formik.values.relatedCourseworks,
                  newCoursework.trim(),
                ]);
              }
              setNewCoursework("");
            }
          }}
          placeholder="Type and press Enter to add"
          className="mb-2"
        />
        <div className="flex flex-wrap gap-2">
          {formik.values.relatedCourseworks.map((course) => (
            <Badge key={course} variant="secondary" className="px-2 py-1">
              {course}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() =>
                  formik.setFieldValue(
                    "relatedCourseworks",
                    formik.values.relatedCourseworks.filter((c) => c !== course)
                  )
                }
              />
            </Badge>
          ))}
        </div>
        {formik.touched.relatedCourseworks &&
          formik.errors.relatedCourseworks && (
            <p className="text-sm text-red-500">
              {formik.errors.relatedCourseworks}
            </p>
          )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setEditingEducation(null);
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
    return <div className="text-center py-4">Loading educations...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Education</h1>
        <Button
          onClick={() => setEditingEducation(createEmptyEducation())}
          disabled={!!editingEducation}
        >
          Add Education
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {editingEducation && !editingEducation._id && (
          <Card className="relative">
            <CardContent className="pt-6">
              {renderEducationForm(editingEducation, true)}
            </CardContent>
          </Card>
        )}

        {educations.map((edu) => (
          <Card key={edu._id} className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 hover:bg-destructive hover:text-destructive-foreground z-10"
              onClick={() => setDeleteId(edu._id || null)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <CardContent className="pt-6">
              {editingEducation?._id === edu._id ? (
                renderEducationForm(edu)
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>University</Label>
                      <p className="text-lg font-medium">
                        {edu.universityName}
                      </p>
                    </div>
                    <div>
                      <Label>Degree</Label>
                      <p className="text-gray-600">{edu.degree}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Major</Label>
                      <p className="text-gray-600">{edu.major}</p>
                    </div>
                    <div>
                      <Label>GPA</Label>
                      <p className="text-gray-600">{edu.gpa}</p>
                    </div>
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <p className="text-sm text-gray-500">
                      {formatDateForDisplay(edu.startDate)} -{" "}
                      {edu.isPursuing
                        ? "Present"
                        : formatDateForDisplay(edu.endDate)}
                    </p>
                  </div>
                  <div>
                    <Label>Related Courseworks</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {edu.relatedCourseworks.map((course) => (
                        <Badge key={course} variant="secondary">
                          {course}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => setEditingEducation(edu)}>
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
              education.
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

export default EducationPage;
