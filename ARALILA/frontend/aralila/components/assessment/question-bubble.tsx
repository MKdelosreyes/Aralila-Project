import Image from "next/image";

type QuestionBubbleProps = {
  question: string;
  challengeType?: string;
};

export const QuestionBubble = ({
  question,
  challengeType,
}: QuestionBubbleProps) => {
  return (
    <div className="mb-6 flex items-center gap-x-4">
      <Image
        src="/images/character/lila-normal.png"
        alt="Mascot"
        height={120}
        width={120}
        className="hidden lg:block"
      />
      <Image
        src="/images/character/lila-normal.png"
        alt="Mascot"
        height={60}
        width={60}
        className="block lg:hidden"
      />

      <div
        className={
          challengeType === "COMPOSE"
            ? "relative rounded-xl border-2 px-4 py-2 text-sm lg:text-4xl text-center"
            : "relative rounded-xl border-2 px-4 py-2 text-sm lg:text-base"
        }
      >
        {question}

        <div
          className="absolute -left-3 top-1/2 h-0 w-0 -translate-y-1/2 rotate-90 transform border-x-8 border-t-8 border-x-transparent"
          aria-hidden
        />
      </div>
    </div>
  );
};
