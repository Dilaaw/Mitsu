import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface RefreshButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  title?: string;
  size?: number;
}

export function RefreshButton({
  onClick,
  loading = false,
  disabled = false,
  title = "Refresh",
  size = 14,
}: RefreshButtonProps) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    if (!loading && !disabled) {
      setIsClicked(true);
      onClick();
      // Reset l'animation après un court délai
      setTimeout(() => setIsClicked(false), 200);
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes refresh-spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          
          @keyframes refresh-click {
            0% {
              transform: rotate(0deg) scale(1);
            }
            50% {
              transform: rotate(-30deg) scale(0.9);
            }
            100% {
              transform: rotate(0deg) scale(1);
            }
          }
          
          .refresh-icon-spinning {
            animation: refresh-spin 1s linear infinite;
          }
          
          .refresh-icon-click {
            animation: refresh-click 0.2s ease-in-out;
          }
        `}
      </style>

      <Button
        onClick={handleClick}
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-sidebar-accent/80"
        title={title}
        disabled={disabled || loading}
      >
        <RefreshCw
          size={size}
          className={`${
            loading
              ? "refresh-icon-spinning"
              : isClicked
                ? "refresh-icon-click"
                : ""
          }`}
        />
      </Button>
    </>
  );
}
