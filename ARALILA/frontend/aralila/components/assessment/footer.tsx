import { CheckCircle, XCircle } from "lucide-react";
import { useKey, useMedia } from "react-use";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FooterProps = {
  onCheck: () => void;
  status: "correct" | "wrong" | "none" | "completed";
  disabled?: boolean;
  lessonId?: number;
  resetAssessment: () => void;
  aiFeedback?: string;
  aiScore?: number;
  isChecking?: boolean;
};

export const Footer = ({
  onCheck,
  status,
  disabled,
  lessonId,
  resetAssessment,
  aiFeedback,
  aiScore,
  isChecking = false,
}: FooterProps) => {
  useKey("Enter", onCheck, {}, [onCheck]);
  const isMobile = useMedia("(max-width: 1024px)");

  return (
    <footer
      className={cn(
        "h-[100px] border-t-2 lg:h-[140px]",
        status === "correct" && "border-transparent bg-green-100",
        status === "wrong" && "border-transparent bg-rose-100"
      )}
    >
      <div className="mx-auto flex h-full max-w-[1140px] items-center justify-between px-6 lg:px-10">
        {status === "correct" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center text-base font-bold text-green-500 lg:text-2xl">
              <CheckCircle className="mr-4 h-6 w-6 lg:h-10 lg:w-10" />
              Nicely done!
            </div>
            {aiFeedback && (
              <div className="text-sm text-neutral-600 max-w-xl">
                <span className="font-semibold">Score: {aiScore}%</span>
                <p className="mt-1">{aiFeedback}</p>
              </div>
            )}
          </div>
        )}

        {status === "wrong" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center text-base font-bold text-rose-500 lg:text-2xl">
              <XCircle className="mr-4 h-6 w-6 lg:h-10 lg:w-10" />
              Try again.
            </div>
            {aiFeedback && (
              <div className="text-sm text-neutral-600 max-w-xl">
                <span className="font-semibold">Score: {aiScore}%</span>
                <p className="mt-1">{aiFeedback}</p>
              </div>
            )}
          </div>
        )}

        {status === "completed" && (
          <Button
            variant="default"
            size={isMobile ? "sm" : "lg"}
            onClick={() => (window.location.href = `/lesson/${lessonId}`)}
          >
            Practice again
          </Button>
        )}

        <Button
          disabled={disabled || isChecking}
          aria-disabled={disabled || isChecking}
          className="ml-auto px-12 py-5 text-base border border-gray-300"
          onClick={onCheck}
          size={isMobile ? "sm" : "lg"}
          variant={status === "wrong" ? "danger" : "secondary"}
        >
          {isChecking ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Checking...
            </span>
          ) : status === "none" ? (
            "Check"
          ) : status === "correct" ? (
            "Next"
          ) : status === "wrong" ? (
            "Retry"
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </footer>
  );
};
