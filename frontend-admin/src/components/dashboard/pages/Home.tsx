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
import { Check, Copy, Search, X, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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

  return (
    <div className="space-y-6 p-6">
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
        </>
      )}
    </div>
  );
}
