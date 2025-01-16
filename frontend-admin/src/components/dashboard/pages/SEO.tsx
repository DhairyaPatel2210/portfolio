import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { seoSchema } from "@/lib/validations/seo";
import { SEO } from "@/lib/types/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const initialValues: SEO = {
  title: "",
  description: "",
  keywords: [],
};

function SEOPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [seoData, setSeoData] = useState<SEO | null>(null);
  const [newKeyword, setNewKeyword] = useState("");

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
      const data = await response.json();

      setSeoData(data || null);
      if (data) {
        formik.setValues({
          ...data.seo,
          keywords: data.seo.keywords || [],
        });
      }
    } catch (error) {
      toast.error("Failed to load SEO data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (values: SEO) => {
    try {
      const response = await fetch("/api/users/seo", {
        method: seoData ? "PUT" : "POST",
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
    initialValues: seoData || initialValues,
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
