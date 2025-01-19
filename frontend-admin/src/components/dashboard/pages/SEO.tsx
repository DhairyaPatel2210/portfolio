import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { seoSchema } from "@/lib/validations/seo";
import { SEO, SEOResponse } from "@/lib/types/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const initialValues: SEO = {
  title: "",
  description: "",
  keywords: [],
  image: "",
};

function SEOPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [seoData, setSeoData] = useState<SEOResponse | null>(null);
  const [newKeyword, setNewKeyword] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchSEO();
  }, []);

  const fetchSEO = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users/seo", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch SEO data");
      const data: SEOResponse = await response.json();

      setSeoData(data);
      if (data) {
        formik.setValues({
          title: data.seo.title,
          description: data.seo.description,
          keywords: data.seo.keywords || [],
          image: "",
        });
        if (data.seo.image?.s3Url) {
          setImagePreview(data.seo.image.s3Url);
        }
      }
    } catch (error) {
      toast.error("Failed to load SEO data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        formik.setFieldValue("image", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (values: SEO) => {
    try {
      const response = await fetch("/api/users/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Failed to save SEO data");
      const savedData = await response.json();
      setSeoData(savedData);
      toast.success("SEO data saved successfully");
    } catch (error) {
      toast.error("Failed to save SEO data");
    }
  };

  const formik = useFormik({
    initialValues: {
      title: seoData?.seo.title || initialValues.title,
      description: seoData?.seo.description || initialValues.description,
      keywords: seoData?.seo.keywords || initialValues.keywords,
      image: "",
    },
    validationSchema: seoSchema,
    onSubmit: handleFormSubmit,
    enableReinitialize: true,
  });

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      const keywords = [...(formik.values.keywords || [])];
      if (!keywords.includes(newKeyword.trim())) {
        keywords.push(newKeyword.trim());
        formik.setFieldValue("keywords", keywords);
      }
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    const keywords = (formik.values.keywords || []).filter(
      (k) => k !== keyword
    );
    formik.setFieldValue("keywords", keywords);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardContent className="p-6">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...formik.getFieldProps("title")}
                className={cn(
                  formik.touched.title &&
                    formik.errors.title &&
                    "border-red-500"
                )}
              />
              {formik.touched.title && formik.errors.title && (
                <p className="text-sm text-red-500">{formik.errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...formik.getFieldProps("description")}
                className={cn(
                  formik.touched.description &&
                    formik.errors.description &&
                    "border-red-500"
                )}
                rows={4}
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-sm text-red-500">
                  {formik.errors.description}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="keywords">Keywords</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="keywords"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a keyword and press Enter"
                />
                <Button
                  type="button"
                  onClick={handleAddKeyword}
                  variant="secondary"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(formik.values.keywords || []).map((keyword) => (
                  <Badge
                    key={keyword}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {keyword}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveKeyword(keyword)}
                    />
                  </Badge>
                ))}
              </div>
              {formik.touched.keywords && formik.errors.keywords && (
                <p className="text-sm text-red-500">
                  {formik.errors.keywords as string}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="image">SEO Image</Label>
              <div className="mt-2 space-y-4">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div
                  className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-primary"
                  onClick={() => document.getElementById("image")?.click()}
                >
                  {imagePreview ? (
                    <div className="relative w-full max-w-md">
                      <img
                        src={imagePreview}
                        alt="SEO Preview"
                        className="w-full h-auto rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagePreview(null);
                          formik.setFieldValue("image", "");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  )}
                </div>
                {formik.touched.image && formik.errors.image && (
                  <p className="text-sm text-red-500">{formik.errors.image}</p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full">
              Save SEO Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SEOPage;
