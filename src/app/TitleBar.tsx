import { useAtom } from "jotai";
import { selectedAppIdAtom } from "@/atoms/appAtoms";
import { useLoadApps } from "@/hooks/useLoadApps";
import { useRouter, useLocation } from "@tanstack/react-router";
import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
// @ts-ignore
import logo from "../../assets/logo_transparent.png";
import { providerSettingsRoute } from "@/routes/settings/providers/$provider";
import { cn } from "@/lib/utils";
import { useDeepLink } from "@/contexts/DeepLinkContext";
import { useEffect, useState, useMemo } from "react";
import { DyadProSuccessDialog } from "@/components/DyadProSuccessDialog";
import { useTheme } from "@/contexts/ThemeContext";
import { IpcClient } from "@/ipc/ipc_client";
import { useUserBudgetInfo } from "@/hooks/useUserBudgetInfo";
import { UserBudgetInfo } from "@/ipc/ipc_types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { PreviewHeader } from "@/components/preview_panel/PreviewHeader";

export const TitleBar = () => {
  const [selectedAppId, setSelectedAppId] = useAtom(selectedAppIdAtom);
  const { apps } = useLoadApps();
  const { navigate } = useRouter();
  const location = useLocation();
  const { settings, refreshSettings } = useSettings();
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [showWindowControls, setShowWindowControls] = useState(false);

  // Memoized computation for selected app
  const selectedApp = useMemo(() => {
    return apps.find((app) => app.id === selectedAppId);
  }, [apps, selectedAppId]);

  // Memoized computation for dropdown apps sorting
  const sortedAppsForDropdown = useMemo(() => {
    return [...apps].sort((a, b) => {
      // Put selected app first
      if (a.id === selectedAppId) return -1;
      if (b.id === selectedAppId) return 1;

      // Sort others by creation date (most recent first)
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [apps, selectedAppId]);

  // Simple calculations - no need for useMemo
  const displayText = selectedApp ? selectedApp.name : "No app selected";
  const isDyadPro = !!settings?.providerSettings?.auto?.apiKey?.value;
  const isDyadProEnabled = Boolean(settings?.enableDyadPro);

  useEffect(() => {
    // Check if we're running on Windows
    const checkPlatform = async () => {
      try {
        const platform = await IpcClient.getInstance().getSystemPlatform();
        setShowWindowControls(platform !== "darwin");
      } catch (error) {
        console.error("Failed to get platform info:", error);
      }
    };

    checkPlatform();
  }, []);

  const showDyadProSuccessDialog = () => {
    setIsSuccessDialogOpen(true);
  };

  const { lastDeepLink } = useDeepLink();
  useEffect(() => {
    const handleDeepLink = async () => {
      if (lastDeepLink?.type === "dyad-pro-return") {
        await refreshSettings();
        showDyadProSuccessDialog();
      }
    };
    handleDeepLink();
  }, [lastDeepLink, refreshSettings]);

  const handleAppSelect = (appId: number) => {
    setSelectedAppId(appId);
    // Navigate to chat page
    navigate({
      to: "/chat",
    });
  };

  return (
    <>
      <div className="@container z-11 w-full h-11 bg-(--sidebar) absolute top-0 left-0 app-region-drag flex items-center">
        <div className={`${showWindowControls ? "pl-2" : "pl-18"}`}></div>

        <img src={logo} alt="Dyad Logo" className="w-6 h-6 mr-0.5" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              data-testid="title-bar-app-name-button"
              variant="ghost"
              size="sm"
              className={cn(
                "hidden @2xl:flex no-app-region-drag text-xs max-w-48 truncate font-medium items-center gap-1.5 px-2.5 py-1 h-7 transition-colors rounded-md border",
                selectedApp
                  ? "bg-muted/50 border-border hover:bg-muted"
                  : "border-transparent hover:bg-muted/50",
              )}
            >
              <span className="truncate">{displayText}</span>
              <ChevronDown size={10} className="opacity-60 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-56 max-h-72 overflow-hidden bg-popover border shadow-lg"
          >
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground/80 border-b border-border/50">
              Applications
            </div>
            <div className="max-h-60 overflow-y-auto py-1">
              {apps.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <div className="text-sm text-muted-foreground">
                    No applications available
                  </div>
                  <div className="text-xs text-muted-foreground/70 mt-1">
                    Create your first app to get started
                  </div>
                </div>
              ) : (
                <>
                  {sortedAppsForDropdown.map((app, index) => (
                    <div key={app.id}>
                      <DropdownMenuItem
                        onClick={() => handleAppSelect(app.id)}
                        className={cn(
                          "mx-1 px-2 py-2 cursor-pointer rounded-sm transition-all duration-150",
                          selectedAppId === app.id
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/60",
                        )}
                      >
                        <div className="flex items-center justify-between w-full min-w-0">
                          <span className="truncate text-sm flex-1">
                            {app.name}
                          </span>
                          {selectedAppId === app.id && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary flex-shrink-0">
                              Current
                            </span>
                          )}
                        </div>
                      </DropdownMenuItem>
                      {selectedAppId === app.id &&
                        index < sortedAppsForDropdown.length - 1 && (
                          <div className="mx-3 my-1 h-px bg-border/30" />
                        )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        {isDyadPro && <DyadProButton isDyadProEnabled={isDyadProEnabled} />}

        {/* Preview Header */}
        {location.pathname === "/chat" && (
          <div className="flex-1 flex justify-end">
            <PreviewHeader />
          </div>
        )}

        {showWindowControls && <WindowsControls />}
      </div>

      <DyadProSuccessDialog
        isOpen={isSuccessDialogOpen}
        onClose={() => setIsSuccessDialogOpen(false)}
      />
    </>
  );
};

function WindowsControls() {
  const { isDarkMode } = useTheme();
  const ipcClient = IpcClient.getInstance();

  const minimizeWindow = () => {
    ipcClient.minimizeWindow();
  };

  const maximizeWindow = () => {
    ipcClient.maximizeWindow();
  };

  const closeWindow = () => {
    ipcClient.closeWindow();
  };

  return (
    <div className="ml-auto flex no-app-region-drag">
      <button
        className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        onClick={minimizeWindow}
        aria-label="Minimize"
      >
        <svg
          width="12"
          height="1"
          viewBox="0 0 12 1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            width="12"
            height="1"
            fill={isDarkMode ? "#ffffff" : "#000000"}
          />
        </svg>
      </button>
      <button
        className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        onClick={maximizeWindow}
        aria-label="Maximize"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="0.5"
            y="0.5"
            width="11"
            height="11"
            stroke={isDarkMode ? "#ffffff" : "#000000"}
          />
        </svg>
      </button>
      <button
        className="w-10 h-10 flex items-center justify-center hover:bg-red-500 transition-colors"
        onClick={closeWindow}
        aria-label="Close"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L11 11M1 11L11 1"
            stroke={isDarkMode ? "#ffffff" : "#000000"}
            strokeWidth="1.5"
          />
        </svg>
      </button>
    </div>
  );
}

export function DyadProButton({
  isDyadProEnabled,
}: {
  isDyadProEnabled: boolean;
}) {
  const { navigate } = useRouter();
  const { userBudget } = useUserBudgetInfo();
  return (
    <Button
      data-testid="title-bar-dyad-pro-button"
      onClick={() => {
        navigate({
          to: providerSettingsRoute.id,
          params: { provider: "auto" },
        });
      }}
      variant="outline"
      className={cn(
        "hidden @2xl:block ml-1 no-app-region-drag h-7 bg-indigo-600 text-white dark:bg-indigo-600 dark:text-white text-xs px-2 pt-1 pb-1",
        !isDyadProEnabled && "bg-zinc-600 dark:bg-zinc-600",
      )}
      size="sm"
    >
      {isDyadProEnabled ? "Pro" : "Pro (off)"}
      {userBudget && isDyadProEnabled && (
        <AICreditStatus userBudget={userBudget} />
      )}
    </Button>
  );
}

export function AICreditStatus({ userBudget }: { userBudget: UserBudgetInfo }) {
  const remaining = Math.round(
    userBudget.totalCredits - userBudget.usedCredits,
  );
  return (
    <Tooltip>
      <TooltipTrigger>
        <div className="text-xs pl-1 mt-0.5">{remaining} credits</div>
      </TooltipTrigger>
      <TooltipContent>
        <div>
          <p>
            You have used {Math.round(userBudget.usedCredits)} credits out of{" "}
            {userBudget.totalCredits}.
          </p>
          <p>
            Your budget resets on{" "}
            {userBudget.budgetResetDate.toLocaleDateString()}
          </p>
          <p>Note: there is a slight delay in updating the credit status.</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
