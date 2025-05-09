import { useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import axios from "@/lib/axios";
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

const Status = () => {
  const [value, setValue] = useState<string | undefined>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get("/users/status");
        setValue(response.data.status);
      } catch (error) {
        setError("Failed to fetch status content");
      }
    };
    fetchStatus();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put("/users/status", {
        status: value,
      });
      setSuccess("Status updated successfully");
    } catch (error) {
      setError("Failed to update status");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Status</h1>
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

export default Status;
