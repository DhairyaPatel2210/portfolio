import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Analytics {
  googleAnalyticsId: string;
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<Analytics>({
    googleAnalyticsId: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/users/analytics", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setAnalytics(data.analytics);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        toast.error("Failed to fetch analytics settings");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/users/analytics", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          googleAnalyticsId: analytics.googleAnalyticsId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnalytics(data.analytics);
      toast.success("Analytics settings saved successfully");
    } catch (error) {
      console.error("Error saving analytics:", error);
      toast.error("Failed to save analytics settings");
    } finally {
      setSaving(false);
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
      <h2 className="text-2xl font-bold">Analytics Settings</h2>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Google Analytics</h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="googleAnalyticsId">Tracking ID</Label>
              <Input
                id="googleAnalyticsId"
                placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X"
                value={analytics.googleAnalyticsId}
                onChange={(e) =>
                  setAnalytics({
                    ...analytics,
                    googleAnalyticsId: e.target.value,
                  })
                }
              />
              <p className="text-sm text-gray-500">
                Enter your Google Analytics tracking ID (starts with G- or UA-)
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
    </div>
  );
}
