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

interface Contact {
  location: string;
  personalEmail: string;
  fromEmail: string;
  sendGridApiKey: string;
}

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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [contact, setContact] = useState<Contact>({
    location: "",
    personalEmail: "",
    fromEmail: "",
    sendGridApiKey: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [hasGeneratedKey, setHasGeneratedKey] = useState(false);
  const [showKeyWarning, setShowKeyWarning] = useState(false);

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchProjects(),
          fetchSocials(),
          fetchApiKey(),
          fetchFeaturedProjects(),
          fetchFeaturedSocials(),
          fetchContact(),
        ]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []); // Empty dependency array as this should only run once on mount

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive",
      });
      setProjects([]);
    }
  };

  const fetchFeaturedProjects = async () => {
    try {
      const response = await fetch("/api/users/featured-projects", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch featured projects");
      const data = await response.json();
      setFeaturedProjects(
        Array.isArray(data.featuredProjects) ? data.featuredProjects : []
      );
    } catch (error) {
      console.error("Error fetching featured projects:", error);
      toast({
        title: "Error",
        description: "Failed to fetch featured projects",
        variant: "destructive",
      });
      setFeaturedProjects([]);
    }
  };

  const saveFeaturedProjects = async () => {
    try {
      setIsSavingProjects(true);

      const payload = {
        projectIds: featuredProjects.map((p) => p._id),
      };
      const response = await fetch("/api/users/featured-projects", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to save featured projects");

      toast({
        title: "Success",
        description: "Featured projects saved successfully",
      });
    } catch (error) {
      console.error("Error saving featured projects:", error);
      toast({
        title: "Error",
        description: "Failed to save featured projects",
        variant: "destructive",
      });
    } finally {
      setIsSavingProjects(false);
    }
  };

  const fetchSocials = async () => {
    try {
      const response = await fetch("/api/socials", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch socials");
      const data = await response.json();
      setSocials(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching socials:", error);
      toast({
        title: "Error",
        description: "Failed to fetch socials",
        variant: "destructive",
      });
      setSocials([]);
    }
  };

  const fetchFeaturedSocials = async () => {
    try {
      const response = await fetch("/api/users/featured-socials", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch featured socials");
      const data = await response.json();

      setSelectedSocials(
        Array.isArray(data.featuredSocials) ? data.featuredSocials : []
      );
    } catch (error) {
      console.error("Error fetching featured socials:", error);
      toast({
        title: "Error",
        description: "Failed to fetch featured socials",
        variant: "destructive",
      });
      setSelectedSocials([]);
    }
  };

  const saveFeaturedSocials = async () => {
    try {
      setIsSavingSocials(true);
      const payload = {
        socialIds: selectedSocials.map((s) => s._id),
      };
      const response = await fetch("/api/users/featured-socials", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to save featured socials");

      toast({
        title: "Success",
        description: "Featured socials saved successfully",
      });
    } catch (error) {
      console.error("Error saving featured socials:", error);
      toast({
        title: "Error",
        description: "Failed to save featured socials",
        variant: "destructive",
      });
    } finally {
      setIsSavingSocials(false);
    }
  };

  const fetchApiKey = async () => {
    try {
      const response = await fetch("/api/users/api-key", {
        credentials: "include",
      });
      const data = await response.json();
      setApiKey(data.apiKey);
    } catch (error) {
      console.error("Error fetching API key:", error);
    }
  };

  const generateApiKey = async () => {
    try {
      const response = await fetch("/api/users/api-key", {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      setApiKey(data.apiKey);
      toast({
        title: "Success",
        description: "API key generated successfully",
      });
    } catch (error) {
      console.error("Error generating API key:", error);
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

  const fetchContact = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/contact", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.contact) {
        setContact({
          location: data.contact.location || "",
          personalEmail: data.contact.personalEmail || "",
          fromEmail: data.contact.fromEmail || "",
          sendGridApiKey: data.contact.sendGridApiKey || "",
        });
      }
    } catch (error) {
      console.error("Error fetching contact:", error);
      toast({
        title: "Error",
        description: "Failed to fetch contact information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/contact", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ contact }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.contact) {
        setContact({
          location: data.contact.location || "",
          personalEmail: data.contact.personalEmail || "",
          fromEmail: data.contact.fromEmail || "",
          sendGridApiKey: data.contact.sendGridApiKey || "",
        });
      }

      toast({
        title: "Success",
        description: "Contact information saved successfully",
      });
    } catch (error) {
      console.error("Error saving contact:", error);
      toast({
        title: "Error",
        description: "Failed to save contact information",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const generatePublicKey = async () => {
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
      const response = await fetch("/api/users/public-key", {
        method: publicKey ? "POST" : "GET", // POST for regeneration, GET for first time
        credentials: "include",
      });
      const data = await response.json();
      setPublicKey(data.publicKey);
      setHasGeneratedKey(true);
      setShowKeyWarning(false);
      toast({
        title: "Important!",
        description:
          "Please copy and securely store this public key. You'll need it for API authentication.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate public key",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const copyPublicKey = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      toast({
        title: "Success",
        description: "Public key copied to clipboard",
      });
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
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold">Contact Information</h2>
      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                onClick={saveFeaturedProjects}
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
                onClick={saveFeaturedSocials}
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
                <Button onClick={generateApiKey}>Generate API Key</Button>
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
                        onClick={copyPublicKey}
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
                  onClick={generatePublicKey}
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
        </>
      )}
    </div>
  );
}
