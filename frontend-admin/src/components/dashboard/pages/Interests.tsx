import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

interface Interests {
  businessDomain: string[];
  programmingLanguage: string[];
  framework: string[];
}

function Interests() {
  const [interests, setInterests] = useState<Interests>({
    businessDomain: [],
    programmingLanguage: [],
    framework: [],
  });

  const [newInputs, setNewInputs] = useState({
    businessDomain: "",
    programmingLanguage: "",
    framework: "",
  });

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
      const { data } = await api.get("/users/interests");
      setInterests(data.interests);
    } catch (error) {
      toast.error("Failed to load interests");
    }
  };

  const handleSave = async () => {
    try {
      await api.put("/users/interests", {
        businessDomain: interests.businessDomain,
        programmingLanguage: interests.programmingLanguage,
        framework: interests.framework,
      });
      toast.success("Interests updated successfully");
    } catch (error) {
      toast.error("Failed to update interests");
    }
  };

  const addInterest = (type: keyof Interests) => {
    const maxLimits = {
      businessDomain: 3,
      programmingLanguage: 4,
      framework: 4,
    };

    const newValue = newInputs[type].trim();
    if (!newValue) return;

    if (interests[type].length >= maxLimits[type]) {
      toast.error(
        `You can only add up to ${maxLimits[type]} ${type
          .replace(/([A-Z])/g, " $1")
          .toLowerCase()}`
      );
      return;
    }

    if (interests[type].includes(newValue)) {
      toast.error("This item already exists");
      return;
    }

    setInterests((prev) => ({
      ...prev,
      [type]: [...prev[type], newValue],
    }));
    setNewInputs((prev) => ({ ...prev, [type]: "" }));
  };

  const removeInterest = (type: keyof Interests, value: string) => {
    setInterests((prev) => ({
      ...prev,
      [type]: prev[type].filter((item) => item !== value),
    }));
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Business Domain Card */}
        <Card>
          <CardHeader>
            <CardTitle>Business Domain</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newInputs.businessDomain}
                onChange={(e) =>
                  setNewInputs((prev) => ({
                    ...prev,
                    businessDomain: e.target.value,
                  }))
                }
                placeholder="Add domain"
                onKeyPress={(e) =>
                  e.key === "Enter" && addInterest("businessDomain")
                }
              />
              <Button onClick={() => addInterest("businessDomain")}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.businessDomain.map((domain) => (
                <Badge
                  key={domain}
                  variant="secondary"
                  className="flex gap-1 items-center"
                >
                  {domain}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeInterest("businessDomain", domain)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Programming Languages Card */}
        <Card>
          <CardHeader>
            <CardTitle>Programming Languages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newInputs.programmingLanguage}
                onChange={(e) =>
                  setNewInputs((prev) => ({
                    ...prev,
                    programmingLanguage: e.target.value,
                  }))
                }
                placeholder="Add language"
                onKeyPress={(e) =>
                  e.key === "Enter" && addInterest("programmingLanguage")
                }
              />
              <Button onClick={() => addInterest("programmingLanguage")}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.programmingLanguage.map((lang) => (
                <Badge
                  key={lang}
                  variant="secondary"
                  className="flex gap-1 items-center"
                >
                  {lang}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeInterest("programmingLanguage", lang)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Frameworks Card */}
        <Card>
          <CardHeader>
            <CardTitle>Frameworks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newInputs.framework}
                onChange={(e) =>
                  setNewInputs((prev) => ({
                    ...prev,
                    framework: e.target.value,
                  }))
                }
                placeholder="Add framework"
                onKeyPress={(e) =>
                  e.key === "Enter" && addInterest("framework")
                }
              />
              <Button onClick={() => addInterest("framework")}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.framework.map((framework) => (
                <Badge
                  key={framework}
                  variant="secondary"
                  className="flex gap-1 items-center"
                >
                  {framework}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeInterest("framework", framework)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}

export default Interests;
