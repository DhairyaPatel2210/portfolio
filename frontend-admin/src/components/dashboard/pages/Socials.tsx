import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Social } from "@/lib/types/social";
import { socialSchema } from "@/lib/validations/social";
import { toast } from "sonner";
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

const Socials = () => {
  const [socials, setSocials] = useState<Social[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    socialId?: string;
    socialName?: string;
  }>({ isOpen: false });

  useEffect(() => {
    fetchSocials();
  }, []);

  const fetchSocials = async () => {
    try {
      const response = await fetch("/api/socials");
      const data = await response.json();
      setSocials(data);
    } catch (error) {
      toast.error("Failed to fetch socials");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: Omit<Social, "_id">) => {
    try {
      const response = await fetch("/api/socials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      setSocials([...socials, data]);
      setShowNewForm(false);
      toast.success("Social added successfully");
    } catch (error) {
      toast.error("Failed to create social");
    }
  };

  const handleUpdate = async (id: string, values: Partial<Social>) => {
    try {
      const response = await fetch(`/api/socials/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      setSocials(socials.map((social) => (social._id === id ? data : social)));
      toast.success("Social updated successfully");
    } catch (error) {
      toast.error("Failed to update social");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/socials/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Remove from featured section");
        return;
      }
      setSocials(socials.filter((social) => social._id !== id));
      toast.success("Social deleted successfully");
    } catch (error) {
      toast.error("Failed to delete social");
    } finally {
      setDeleteDialog({ isOpen: false });
    }
  };

  const handleImageUpload = async (file: File) => {
    // Validate file type
    if (file.type !== "image/png") {
      throw new Error("Only PNG images are allowed");
    }

    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const SocialCard = ({
    social,
    isNew = false,
  }: {
    social?: Social;
    isNew?: boolean;
  }) => {
    const initialValues = {
      name: social?.name || "",
      link: social?.link || "",
      icon: "",
    };

    return (
      <Card className="p-4 relative">
        {!isNew && social?._id && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={() =>
              setDeleteDialog({
                isOpen: true,
                socialId: social._id,
                socialName: social.name,
              })
            }
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Formik
          initialValues={initialValues}
          validationSchema={socialSchema}
          enableReinitialize
          onSubmit={async (values) => {
            const submitValues = {
              name: values.name,
              link: values.link,
              icon: values.icon || "",
            };

            if (isNew) {
              await handleCreate(submitValues);
            } else if (social?._id) {
              const updateValues = {
                ...submitValues,
                icon: values.icon || undefined,
              };
              await handleUpdate(social._id, updateValues);
            }
          }}
        >
          {({ errors, touched, setFieldValue, values }) => (
            <Form className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Field
                  as={Input}
                  id="name"
                  name="name"
                  placeholder="Social Media Name"
                />
                {errors.name && touched.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="link">Link</Label>
                <Field
                  as={Input}
                  id="link"
                  name="link"
                  placeholder="https://..."
                />
                {errors.link && touched.link && (
                  <p className="text-sm text-red-500">{errors.link}</p>
                )}
              </div>

              <div>
                <Label htmlFor="icon">Icon (PNG only)</Label>
                <Input
                  id="icon"
                  type="file"
                  accept="image/png"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const base64 = await handleImageUpload(file);
                        setFieldValue("icon", base64);
                      } catch (error) {
                        if (error instanceof Error) {
                          toast.error(error.message);
                        }
                        e.target.value = ""; // Reset file input
                      }
                    }
                  }}
                />
                {(values.icon || social?.s3Link) && (
                  <div className="mt-2 relative w-16 h-16">
                    <img
                      src={values.icon || social?.s3Link}
                      alt="Preview"
                      className="w-full h-full object-cover rounded"
                    />
                    {values.icon && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2"
                        onClick={() => setFieldValue("icon", "")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
                {errors.icon && touched.icon && (
                  <p className="text-sm text-red-500">{errors.icon}</p>
                )}
              </div>

              <Button type="submit">
                {isNew ? "Add Social" : "Save Changes"}
              </Button>
            </Form>
          )}
        </Formik>
      </Card>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Socials</h1>
        <Button onClick={() => setShowNewForm(true)}>Add New Social</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {showNewForm && <SocialCard isNew={true} />}
        {socials.map((social) => (
          <SocialCard key={social._id} social={social} />
        ))}
      </div>

      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open: boolean) => setDeleteDialog({ isOpen: open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deleteDialog.socialName} from your
              socials. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteDialog({ isOpen: false })}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteDialog.socialId && handleDelete(deleteDialog.socialId)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Socials;
