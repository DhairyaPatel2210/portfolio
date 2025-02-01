import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import {
  Social,
  UpdateSocialInput,
  CreateSocialInput,
  IconData,
} from "@/lib/types/social";
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
import api from "@/lib/axios";

interface FormValues {
  name: string;
  link: string;
  lightIcon: string;
  darkIcon: string;
}

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
      const { data } = await api.get("/socials");
      setSocials(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch socials");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: CreateSocialInput) => {
    try {
      const { data } = await api.post("/socials", values);
      setSocials([...socials, data]);
      setShowNewForm(false);
      toast.success("Social added successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create social");
    }
  };

  const handleUpdate = async (id: string, values: UpdateSocialInput) => {
    try {
      const { data } = await api.put(`/socials/${id}`, values);
      setSocials(socials.map((social) => (social._id === id ? data : social)));
      toast.success("Social updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update social");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/socials/${id}`);
      setSocials(socials.filter((social) => social._id !== id));
      toast.success("Social deleted successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete social");
    } finally {
      setDeleteDialog({ isOpen: false });
    }
  };

  const handleImageUpload = async (file: File) => {
    // Validate file type
    if (file.type !== "image/svg+xml") {
      throw new Error("Only SVG images are allowed");
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
    const initialValues: FormValues = {
      name: social?.name || "",
      link: social?.link || "",
      lightIcon: "",
      darkIcon: "",
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
        <Formik<FormValues>
          initialValues={initialValues}
          validationSchema={socialSchema}
          enableReinitialize
          onSubmit={async (values) => {
            // For new social creation
            if (isNew) {
              if (!values.lightIcon || !values.darkIcon) {
                toast.error("Both light and dark theme icons are required");
                return;
              }
              // The backend will handle converting the base64 strings to S3 objects
              await handleCreate({
                name: values.name,
                link: values.link,
                lightIcon: values.lightIcon,
                darkIcon: values.darkIcon,
              } as unknown as CreateSocialInput);
            }
            // For updating existing social
            else if (social?._id) {
              const updateValues: UpdateSocialInput = {
                name: values.name,
                link: values.link,
              };

              // Only include icons in update if they've changed
              if (values.lightIcon) {
                updateValues.lightIcon =
                  values.lightIcon as unknown as IconData;
              }
              if (values.darkIcon) {
                updateValues.darkIcon = values.darkIcon as unknown as IconData;
              }

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

              <div className="space-y-4">
                {/* Light Theme Icon */}
                <div>
                  <Label htmlFor="lightIcon">Light Theme Icon (SVG only)</Label>
                  <Input
                    id="lightIcon"
                    type="file"
                    accept="image/svg+xml"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const base64 = await handleImageUpload(file);
                          setFieldValue("lightIcon", base64);
                        } catch (error) {
                          if (error instanceof Error) {
                            toast.error(error.message);
                          }
                          e.target.value = ""; // Reset file input
                        }
                      }
                    }}
                  />
                  {(values.lightIcon || social?.lightIcon?.s3Link) && (
                    <div className="mt-2 relative w-16 h-16 bg-white rounded">
                      <img
                        src={values.lightIcon || social?.lightIcon?.s3Link}
                        alt={`${values.name || social?.name} light theme icon`}
                        className="w-full h-full object-contain rounded"
                      />
                      {values.lightIcon && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2"
                          onClick={() => setFieldValue("lightIcon", "")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                  {errors.lightIcon && touched.lightIcon && (
                    <p className="text-sm text-red-500">{errors.lightIcon}</p>
                  )}
                </div>

                {/* Dark Theme Icon */}
                <div>
                  <Label htmlFor="darkIcon">Dark Theme Icon (SVG only)</Label>
                  <Input
                    id="darkIcon"
                    type="file"
                    accept="image/svg+xml"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const base64 = await handleImageUpload(file);
                          setFieldValue("darkIcon", base64);
                        } catch (error) {
                          if (error instanceof Error) {
                            toast.error(error.message);
                          }
                          e.target.value = ""; // Reset file input
                        }
                      }
                    }}
                  />
                  {(values.darkIcon || social?.darkIcon?.s3Link) && (
                    <div className="mt-2 relative w-16 h-16 bg-gray-900 rounded">
                      <img
                        src={values.darkIcon || social?.darkIcon?.s3Link}
                        alt={`${values.name || social?.name} dark theme icon`}
                        className="w-full h-full object-contain rounded"
                      />
                      {values.darkIcon && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2"
                          onClick={() => setFieldValue("darkIcon", "")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    Please upload SVG icons for best quality and scalability
                  </p>
                  {errors.darkIcon && touched.darkIcon && (
                    <p className="text-sm text-red-500">{errors.darkIcon}</p>
                  )}
                </div>
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
