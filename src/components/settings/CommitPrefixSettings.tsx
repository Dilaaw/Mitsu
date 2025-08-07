import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { showSuccess, showError } from "@/lib/toast";

export function CommitPrefixSettings() {
  const { settings, updateSettings } = useSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [editPrefix, setEditPrefix] = useState("[mitsu]");
  const [isEnabled, setIsEnabled] = useState(true);

  // Update local state when settings change
  useEffect(() => {
    if (settings?.commitPrefix) {
      setEditPrefix(settings.commitPrefix.prefix || "[mitsu]");
      setIsEnabled(settings.commitPrefix.enabled ?? true);
    }
  }, [settings?.commitPrefix]);

  const handleSave = async () => {
    try {
      await updateSettings({
        commitPrefix: {
          enabled: isEnabled,
          prefix: editPrefix.trim() || "[mitsu]",
        },
      });
      setIsEditing(false);
      showSuccess("Commit prefix settings saved");
    } catch (error: any) {
      showError(error.message || "Error saving settings");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditPrefix(settings?.commitPrefix?.prefix || "[mitsu]");
    setIsEnabled(settings?.commitPrefix?.enabled ?? true);
  };

  const currentPrefix = settings?.commitPrefix?.prefix || "[mitsu]";
  const currentEnabled = settings?.commitPrefix?.enabled ?? true;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Switch
          id="commit-prefix"
          checked={currentEnabled}
          onCheckedChange={(enabled) => {
            updateSettings({
              commitPrefix: {
                enabled,
                prefix: currentPrefix,
              },
            });
          }}
        />
        <Label htmlFor="commit-prefix">Commit prefix</Label>
      </div>

      <div className="flex items-center space-x-2">
        {currentEnabled ? (
          <>
            {isEditing ? (
              <>
                <Input
                  value={editPrefix}
                  onChange={(e) => setEditPrefix(e.target.value)}
                  placeholder="[mitsu]"
                  className="w-20 h-6 text-xs font-mono"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSave}
                  className="h-6 px-2 text-xs"
                >
                  ✓
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  className="h-6 px-2 text-xs"
                >
                  ✕
                </Button>
              </>
            ) : (
              <>
                <code className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-md font-mono border">
                  {currentPrefix}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Edit
                </Button>
              </>
            )}
          </>
        ) : (
          <div className="opacity-0 pointer-events-none">
            <div className="w-16 h-6"></div>
          </div>
        )}
      </div>
    </div>
  );
}
