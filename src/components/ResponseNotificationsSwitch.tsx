import { useSettings } from "@/hooks/useSettings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/lib/toast";

interface ResponseNotificationsProps {
  showToast?: boolean;
}

export function ResponseNotificationsSwitch({
  showToast = true,
}: ResponseNotificationsProps) {
  const { settings, updateSettings, loading } = useSettings();

  const handleToggle = async (enabled: boolean) => {
    try {
      await updateSettings({
        enableResponseCompletedNotifications: enabled,
      });
      if (showToast) {
        showSuccess(
          `Response completion notifications ${enabled ? "enabled" : "disabled"}`,
        );
      }
    } catch (error) {
      console.error("Error updating notification setting:", error);
      if (showToast) {
        showError("Failed to update notification setting");
      }
    }
  };

  // Default to true if setting is undefined
  const isEnabled = settings?.enableResponseCompletedNotifications ?? true;

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="response-notifications"
        checked={isEnabled}
        onCheckedChange={handleToggle}
        disabled={loading}
      />
      <Label htmlFor="response-notifications">
        Response completion notifications
      </Label>
    </div>
  );
}
