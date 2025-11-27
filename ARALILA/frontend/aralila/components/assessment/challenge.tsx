import { cn } from "@/lib/utils";
import { Card } from "./card";

type ChallengeOption = {
  id: number;
  text: string;
  imageSrc: string | null;
  audioSrc: string | null;
  correct: boolean;
};

type ChallengeProps = {
  options: ChallengeOption[];
  onSelect: (id: number) => void;
  status: "correct" | "wrong" | "none";
  selectedOption?: number;
  disabled?: boolean;
  type: string; // "ASSIST" or "SELECT"
};

export const Challenge = ({
  options,
  onSelect,
  status,
  selectedOption,
  disabled,
  type,
}: ChallengeProps) => {
  return (
    <div
      className={cn(
        "grid gap-2",
        type === "ASSIST" && "grid-cols-1",
        type === "SELECT" &&
          "grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))]"
      )}
    >
      {options.map((option, i) => (
        <Card
          key={option.id}
          id={option.id}
          text={option.text}
          imageSrc={option.imageSrc}
          shortcut={`${i + 1}`}
          selected={selectedOption === option.id}
          onClick={() => onSelect(option.id)}
          status={status}
          audioSrc={option?.audioSrc}
          disabled={disabled}
          type={type}
        />
      ))}
    </div>
  );
};
