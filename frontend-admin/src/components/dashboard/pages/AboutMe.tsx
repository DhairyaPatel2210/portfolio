import { useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import rehypeSanitize from "rehype-sanitize";

const AboutMe = () => {
  const [value, setValue] = useState<string | undefined>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const response = await api.get("/users/about");
        setValue(response.data.about);
      } catch (error: any) {
        setError(
          error.response?.data?.message || "Failed to fetch about content"
        );
      }
    };
    fetchAbout();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put("/users/about", {
        about: value,
      });
      setSuccess("About content updated successfully");
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Failed to update about content"
      );
    }
    setLoading(false);
  };

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">About Me</h1>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
        <div data-color-mode="light" className="markdown-editor">
          <MDEditor
            value={value}
            onChange={setValue}
            preview="edit"
            height={500}
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

      <AlertDialog open={!!error} onOpenChange={() => setError(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setError(null)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!success} onOpenChange={() => setSuccess(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Success</AlertDialogTitle>
            <AlertDialogDescription>{success}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setSuccess(null)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AboutMe;
