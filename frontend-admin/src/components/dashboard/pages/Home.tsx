import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Project } from "@/lib/types/project";
import { Social } from "@/lib/types/social";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, Search, X, Save, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Origin, OriginFormValues } from "@/lib/types/origin";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

interface Contact {
  location: string;
  personalEmail: string;
  fromEmail: string;
  sendGridApiKey: string;
}

const originValidationSchema = Yup.object().shape({
  origin: Yup.string()
    .matches(
      /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(:\d+)?$/,
      "Invalid origin format. Example: http://localhost:3000 or https://example.com"
    )
    .required("Origin is required"),
  description: Yup.string().required("Description is required"),
});

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [socials, setSocials] = useState<Social[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [selectedSocials, setSelectedSocials] = useState<Social[]>([]);
  const [projectSearch, setProjectSearch] = useState("");
  const [socialSearch, setSocialSearch] = useState("");
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSavingProjects, setIsSavingProjects] = useState(false);
  const [isSavingSocials, setIsSavingSocials] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [contact, setContact] = useState<Contact>({
    location: "",
    personalEmail: "",
    fromEmail: "",
    sendGridApiKey: "",
  });
  const [saving, setSaving] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [hasGeneratedKey, setHasGeneratedKey] = useState(false);
  const [showKeyWarning, setShowKeyWarning] = useState(false);
  const [origins, setOrigins] = useState<Origin[]>([]);
  const [isLoadingOrigins, setIsLoadingOrigins] = useState(false);
  const [isAddingOrigin, setIsAddingOrigin] = useState(false);
  const [isDeletingOrigin, setIsDeletingOrigin] = useState<string | null>(null);

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [
          projectsData,
          socialsData,
          apiKeyData,
          featuredProjectsData,
          featuredSocialsData,
          contactData,
          originsData,
        ] = await Promise.all([
          fetchProjects(),
          fetchSocials(),
          fetchApiKey(),
          fetchFeaturedProjects(),
          fetchFeaturedSocials(),
          fetchContact(),
          fetchOrigins(),
        ]);

        setProjects(projectsData);
        setSocials(socialsData);
        setApiKey(apiKeyData);
        setFeaturedProjects(featuredProjectsData);
        setSelectedSocials(featuredSocialsData);
        if (contactData) {
          setContact({
            location: contactData.location || "",
            personalEmail: contactData.personalEmail || "",
            fromEmail: contactData.fromEmail || "",
            sendGridApiKey: contactData.sendGridApiKey || "",
          });
        }
        setOrigins(originsData);
      } catch (error: any) {
        console.error("Error fetching initial data:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to fetch data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/projects");
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  };

  const fetchFeaturedProjects = async () => {
    try {
      const { data } = await api.get("/users/featured-projects");
      return Array.isArray(data.featuredProjects) ? data.featuredProjects : [];
    } catch (error: any) {
      console.error("Error fetching featured projects:", error);
      throw error;
    }
  };

  const saveFeaturedProjects = async (projectIds: string[]) => {
    try {
      const { data } = await api.put("/users/featured-projects", {
        projectIds,
      });
      return data;
    } catch (error: any) {
      console.error("Error saving featured projects:", error);
      throw error;
    }
  };

  const fetchSocials = async () => {
    try {
      const { data } = await api.get("/socials");
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error("Error fetching socials:", error);
      throw error;
    }
  };

  const fetchFeaturedSocials = async () => {
    try {
      const { data } = await api.get("/users/featured-socials");
      return Array.isArray(data.featuredSocials) ? data.featuredSocials : [];
    } catch (error: any) {
      console.error("Error fetching featured socials:", error);
      throw error;
    }
  };

  const saveFeaturedSocials = async (socialIds: string[]) => {
    try {
      const { data } = await api.put("/users/featured-socials", { socialIds });
      return data;
    } catch (error: any) {
      console.error("Error saving featured socials:", error);
      throw error;
    }
  };

  const fetchApiKey = async () => {
    try {
      const { data } = await api.get("/users/api-key");
      return data.apiKey;
    } catch (error: any) {
      console.error("Error fetching API key:", error);
      throw error;
    }
  };

  const generateApiKey = async () => {
    try {
      const { data } = await api.post("/users/api-key");
      setApiKey(data.apiKey);
      toast({
        title: "Success",
        description: "API key generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to generate API key",
        variant: "destructive",
      });
    }
  };

  const fetchContact = async () => {
    try {
      const { data } = await api.get("/contact");
      return data.contact;
    } catch (error: any) {
      console.error("Error fetching contact:", error);
      throw error;
    }
  };

  const saveContact = async (contact: any) => {
    try {
      const { data } = await api.put("/contact", { contact });
      return data.contact;
    } catch (error: any) {
      console.error("Error saving contact:", error);
      throw error;
    }
  };

  const generatePublicKey = async (isRegeneration: boolean) => {
    try {
      const { data } = await api[isRegeneration ? "post" : "get"](
        "/users/public-key"
      );
      return data.publicKey;
    } catch (error: any) {
      console.error("Error generating public key:", error);
      throw error;
    }
  };

  const handleSaveFeaturedProjects = async () => {
    try {
      setIsSavingProjects(true);
      const projectIds = featuredProjects
        .map((p) => p._id)
        .filter((id): id is string => id !== undefined);
      await saveFeaturedProjects(projectIds);
      toast({
        title: "Success",
        description: "Featured projects saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to save featured projects",
        variant: "destructive",
      });
    } finally {
      setIsSavingProjects(false);
    }
  };

  const handleSaveFeaturedSocials = async () => {
    try {
      setIsSavingSocials(true);
      const socialIds = selectedSocials
        .map((s) => s._id)
        .filter((id): id is string => id !== undefined);
      await saveFeaturedSocials(socialIds);
      toast({
        title: "Success",
        description: "Featured socials saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to save featured socials",
        variant: "destructive",
      });
    } finally {
      setIsSavingSocials(false);
    }
  };

  const handleGenerateApiKey = async () => {
    try {
      const { data } = await api.post("/users/api-key");
      setApiKey(data.apiKey);
      toast({
        title: "Success",
        description: "API key generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to generate API key",
        variant: "destructive",
      });
    }
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updatedContact = await saveContact(contact);
      setContact({
        location: updatedContact.location || "",
        personalEmail: updatedContact.personalEmail || "",
        fromEmail: updatedContact.fromEmail || "",
        sendGridApiKey: updatedContact.sendGridApiKey || "",
      });
      toast({
        title: "Success",
        description: "Contact information saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to save contact information",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePublicKey = async () => {
    if (publicKey && !showKeyWarning) {
      setShowKeyWarning(true);
      toast({
        title: "Warning",
        description:
          "Generating a new key will invalidate the old one. Make sure you want to do this.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGeneratingKey(true);
      const newPublicKey = await generatePublicKey(!!publicKey);
      setPublicKey(newPublicKey);
      setHasGeneratedKey(true);
      setShowKeyWarning(false);
      toast({
        title: "Important!",
        description:
          "Please copy and securely store this public key. You'll need it for API authentication.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to generate public key",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const copyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "API key copied to clipboard",
      });
    }
  };

  const toggleFeaturedProject = (project: Project) => {
    if (featuredProjects.find((p) => p._id === project._id)) {
      setFeaturedProjects(
        featuredProjects.filter((p) => p._id !== project._id)
      );
    } else if (featuredProjects.length < 3) {
      setFeaturedProjects([...featuredProjects, project]);
    } else {
      toast({
        title: "Error",
        description: "You can select maximum 3 featured projects",
        variant: "destructive",
      });
    }
  };

  const toggleSelectedSocial = (social: Social) => {
    if (selectedSocials.find((s) => s._id === social._id)) {
      setSelectedSocials(selectedSocials.filter((s) => s._id !== social._id));
    } else if (selectedSocials.length < 4) {
      setSelectedSocials([...selectedSocials, social]);
    } else {
      toast({
        title: "Error",
        description: "You can select maximum 4 socials",
        variant: "destructive",
      });
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const filteredSocials = socials.filter((social) =>
    social.name.toLowerCase().includes(socialSearch.toLowerCase())
  );

  const fetchOrigins = async () => {
    try {
      const { data } = await api.get("/origins");
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error("Error fetching origins:", error);
      throw error;
    }
  };

  const handleAddOrigin = async (
    values: OriginFormValues,
    { resetForm }: any
  ) => {
    setIsAddingOrigin(true);
    try {
      const { data } = await api.post("/origins", values);
      setOrigins([...origins, data]);
      resetForm();
      toast({
        title: "Success",
        description: "Origin added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add origin",
        variant: "destructive",
      });
    } finally {
      setIsAddingOrigin(false);
    }
  };

  const handleDeleteOrigin = async (id: string) => {
    setIsDeletingOrigin(id);
    try {
      await api.delete(`/origins/${id}`);
      setOrigins(origins.filter((origin) => origin._id !== id));
      toast({
        title: "Success",
        description: "Origin deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete origin",
        variant: "destructive",
      });
    } finally {
      setIsDeletingOrigin(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold">Contact Information</h2>
      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitContact} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., New York, USA"
                value={contact.location}
                onChange={(e) =>
                  setContact({ ...contact, location: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personalEmail">Personal Email</Label>
              <Input
                id="personalEmail"
                type="email"
                placeholder="your@email.com"
                value={contact.personalEmail}
                onChange={(e) =>
                  setContact({ ...contact, personalEmail: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email (for sending emails)</Label>
              <Input
                id="fromEmail"
                type="email"
                placeholder="noreply@yourdomain.com"
                value={contact.fromEmail}
                onChange={(e) =>
                  setContact({ ...contact, fromEmail: e.target.value })
                }
                required
              />
              <p className="text-sm text-gray-500">
                This email will be used as the sender address when visitors send
                you messages
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sendGridApiKey">SendGrid API Key</Label>
              <Input
                id="sendGridApiKey"
                type="password"
                placeholder="Enter your SendGrid API key"
                value={contact.sendGridApiKey}
                onChange={(e) =>
                  setContact({ ...contact, sendGridApiKey: e.target.value })
                }
              />
              <p className="text-sm text-gray-500">
                Required to send emails. Get your API key from SendGrid
                dashboard
              </p>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      ) : (
        <>
          {/* Featured Projects Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Featured Projects</CardTitle>
              <Button
                onClick={handleSaveFeaturedProjects}
                disabled={isSavingProjects}
                size="sm"
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSavingProjects ? "Saving..." : "Save Changes"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {featuredProjects.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        No featured projects selected
                      </div>
                    ) : (
                      featuredProjects.map((project) => (
                        <Badge
                          key={project._id}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {project.title}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => toggleFeaturedProject(project)}
                          />
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project) => (
                      <TableRow key={project._id}>
                        <TableCell>{project.title}</TableCell>
                        <TableCell>
                          {project.currentlyWorking
                            ? "Currently Working"
                            : project.endDate?.toString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant={
                              featuredProjects.find(
                                (p) => p._id === project._id
                              )
                                ? "secondary"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => toggleFeaturedProject(project)}
                          >
                            {featuredProjects.find(
                              (p) => p._id === project._id
                            ) ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              "Select"
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Featured Socials Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Featured Socials</CardTitle>
              <Button
                onClick={handleSaveFeaturedSocials}
                disabled={isSavingSocials}
                size="sm"
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSavingSocials ? "Saving..." : "Save Changes"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search socials..."
                    value={socialSearch}
                    onChange={(e) => setSocialSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Currently Featured Socials:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedSocials.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        No featured socials selected
                      </div>
                    ) : (
                      selectedSocials.map((social) => (
                        <Badge
                          key={social._id}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {social.name}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => toggleSelectedSocial(social)}
                          />
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Social Handle</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSocials.map((social) => (
                      <TableRow key={social._id}>
                        <TableCell>{social.name}</TableCell>
                        <TableCell>
                          <Button
                            variant={
                              selectedSocials.find((s) => s._id === social._id)
                                ? "secondary"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => toggleSelectedSocial(social)}
                          >
                            {selectedSocials.find(
                              (s) => s._id === social._id
                            ) ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              "Select"
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* API Key Card */}
          <Card>
            <CardHeader>
              <CardTitle>API Key Management</CardTitle>
            </CardHeader>
            <CardContent>
              {apiKey ? (
                <div className="flex items-center gap-4">
                  <div className="font-mono bg-secondary p-2 rounded">
                    {apiKey.slice(0, 5)}****
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyApiKey}
                    className="flex items-center gap-2"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              ) : (
                <Button onClick={handleGenerateApiKey}>Generate API Key</Button>
              )}
            </CardContent>
          </Card>

          {/* Public Key Generation Card */}
          <Card>
            <CardHeader>
              <CardTitle>Public Key Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Public Key for API Key Encryption</Label>
                {publicKey ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Input
                        value={publicKey}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyApiKey}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    {hasGeneratedKey && (
                      <p className="text-sm text-yellow-600 dark:text-yellow-500 font-medium mt-2">
                        ⚠️ Important: Copy and store this public key securely.
                        You'll need it for API authentication.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Generate a public key to enable API key encryption. Store it
                    securely as you'll need it for authentication.
                  </p>
                )}
                <Button
                  onClick={handleGeneratePublicKey}
                  disabled={isGeneratingKey}
                  variant={showKeyWarning ? "destructive" : "default"}
                  className="mt-2"
                >
                  {isGeneratingKey ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : showKeyWarning ? (
                    "Confirm New Key Generation"
                  ) : publicKey ? (
                    "Generate New Key"
                  ) : (
                    "Generate Public Key"
                  )}
                </Button>
                {showKeyWarning && (
                  <p className="text-sm text-red-500 mt-2">
                    Warning: Generating a new key will invalidate your old one.
                    All systems using the old key will need to be updated.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* CORS Origins Management Card */}
          <Card>
            <CardHeader>
              <CardTitle>CORS Origins Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Formik
                  initialValues={{
                    origin: "",
                    description: "",
                  }}
                  validationSchema={originValidationSchema}
                  onSubmit={handleAddOrigin}
                >
                  {({ errors, touched }) => (
                    <Form className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="origin">Origin URL</Label>
                        <Field
                          as={Input}
                          id="origin"
                          name="origin"
                          placeholder="https://example.com"
                          className={
                            errors.origin && touched.origin
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {errors.origin && touched.origin && (
                          <p className="text-sm text-red-500">
                            {errors.origin}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Field
                          as={Input}
                          id="description"
                          name="description"
                          placeholder="Frontend application"
                          className={
                            errors.description && touched.description
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {errors.description && touched.description && (
                          <p className="text-sm text-red-500">
                            {errors.description}
                          </p>
                        )}
                      </div>
                      <Button type="submit" disabled={isAddingOrigin}>
                        {isAddingOrigin ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          "Add Origin"
                        )}
                      </Button>
                    </Form>
                  )}
                </Formik>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Allowed Origins
                  </h3>
                  {origins.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No origins added yet
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Origin</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {origins.map((origin) => (
                          <TableRow key={origin._id}>
                            <TableCell className="font-mono">
                              {origin.origin}
                            </TableCell>
                            <TableCell>{origin.description}</TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  origin._id && handleDeleteOrigin(origin._id)
                                }
                                disabled={isDeletingOrigin === origin._id}
                              >
                                {isDeletingOrigin === origin._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Delete"
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
