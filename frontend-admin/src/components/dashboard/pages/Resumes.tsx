import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Resume,
  ResumeResponse,
  UploadResumeResponse,
} from "@/lib/types/resume";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ResumeCard = ({
  resume,
  onDelete,
  onUpload,
  isLoading,
  canDelete,
  index,
}: {
  resume?: Resume;
  onDelete: () => void;
  onUpload: (file: File, displayName: string, index: number) => Promise<void>;
  isLoading: boolean;
  canDelete: boolean;
  index: number;
}) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const uploadId = resume ? resume._id : `new-${index}`;

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setShowUploadDialog(true);
  };

  const handleUpload = async () => {
    if (selectedFile && displayName) {
      await onUpload(selectedFile, displayName, index);
      setShowUploadDialog(false);
      setDisplayName("");
      setSelectedFile(null);
    }
  };

  return (
    <>
      <Card className="w-full relative">
        {resume && canDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 hover:bg-destructive hover:text-destructive-foreground"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        <CardHeader>
          <h3 className="text-lg font-semibold">
            {resume ? resume.displayName : `Upload Resume ${index + 1}`}
          </h3>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : resume ? (
            <div className="space-y-4">
              <iframe
                src={resume.s3Url}
                className="w-full h-[400px]"
                title={resume.displayName}
              />
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                id={`resume-upload-${uploadId}`}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileSelect(file);
                  }
                  e.target.value = ""; // Reset input after upload
                }}
              />
              <Button
                className="w-full"
                onClick={() => {
                  document.getElementById(`resume-upload-${uploadId}`)?.click();
                }}
              >
                Update Resume
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center">
                <Upload className="h-8 w-8 mb-2" />
                <p>Upload a PDF resume</p>
              </div>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                id={`resume-upload-${uploadId}`}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileSelect(file);
                  }
                  e.target.value = ""; // Reset input after upload
                }}
              />
              <Button
                className="w-full"
                onClick={() => {
                  document.getElementById(`resume-upload-${uploadId}`)?.click();
                }}
              >
                Upload Resume
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Resume Display Name</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g., Software Engineer Resume"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleUpload}
              disabled={!displayName}
            >
              Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default function Resumes() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    resumeId?: string;
  }>({ show: false });

  const fetchResumes = async () => {
    try {
      const response = await fetch("/api/resumes/", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ResumeResponse = await response.json();
      const sortedResumes = [...data.resumes].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setResumes(sortedResumes);
    } catch (error) {
      toast.error("Failed to fetch resumes");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleUpload = async (
    file: File,
    displayName: string,
    index: number
  ) => {
    if (!file.type.includes("pdf")) {
      toast.error("Only PDF files are allowed");
      return;
    }

    if (resumes.length >= 2 && !resumes[index]) {
      toast.error("Maximum two resumes allowed");
      return;
    }

    const existingResume = resumes[index];
    const uploadId = existingResume ? existingResume._id : `new-${index}`;

    try {
      setUploadingIds((prev) => new Set(prev.add(uploadId)));

      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      let response: Response;

      if (existingResume) {
        response = await fetch(`/api/resumes/${existingResume._id}`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file: base64Data,
            fileName: file.name,
            displayName: displayName,
            _id: existingResume._id,
          }),
        });
      } else {
        response = await fetch("/api/resumes", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file: base64Data,
            fileName: file.name,
            displayName: displayName,
            index: index,
          }),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData: UploadResumeResponse = await response.json();

      if (response.status === 201 || response.status === 200) {
        // Fetch updated resume list
        const updatedResponse = await fetch("/api/resumes/", {
          method: "GET",
          credentials: "include",
        });

        if (!updatedResponse.ok) {
          throw new Error(
            `Failed to fetch updated resumes: ${updatedResponse.status}`
          );
        }

        const updatedData: ResumeResponse = await updatedResponse.json();
        const sortedResumes = [...updatedData.resumes].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        setResumes(sortedResumes);
        toast.success(responseData.message || "Resume operation successful");
      } else {
        throw new Error(
          responseData.message ||
            `Unexpected response status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        existingResume ? "Failed to update resume" : "Failed to upload resume"
      );
    } finally {
      setUploadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(uploadId);
        return newSet;
      });
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirm({ show: true, resumeId: id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.resumeId) return;

    try {
      const response = await fetch(`/api/resumes/${deleteConfirm.resumeId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setResumes((prev) =>
        prev.filter((r) => r._id !== deleteConfirm.resumeId)
      );
      toast.success("Resume deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete resume");
    } finally {
      setDeleteConfirm({ show: false });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 p-6">
        <h2 className="text-2xl font-bold">Resumes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ResumeCard
            key={`resume-0-${resumes[0]?._id || "empty"}`}
            resume={resumes[0]}
            onDelete={() => resumes[0] && handleDelete(resumes[0]._id!)}
            onUpload={handleUpload}
            isLoading={
              resumes[0]
                ? uploadingIds.has(resumes[0]._id)
                : uploadingIds.has("new-0")
            }
            canDelete={resumes.length > 1}
            index={0}
          />

          {resumes.length > 0 && (
            <ResumeCard
              key={`resume-1-${resumes[1]?._id || "empty"}`}
              resume={resumes[1]}
              onDelete={() => resumes[1] && handleDelete(resumes[1]._id!)}
              onUpload={handleUpload}
              isLoading={
                resumes[1]
                  ? uploadingIds.has(resumes[1]._id)
                  : uploadingIds.has("new-1")
              }
              canDelete={resumes.length > 1}
              index={1}
            />
          )}
        </div>
      </div>

      <AlertDialog open={deleteConfirm.show}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-xl">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              This action cannot be undone. This will permanently delete your
              resume.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel
              className="bg-gray-100 hover:bg-gray-200"
              onClick={() => setDeleteConfirm({ show: false })}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
