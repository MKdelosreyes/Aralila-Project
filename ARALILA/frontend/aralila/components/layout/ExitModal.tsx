"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useExitModal } from "@/store/use-exit-modal";

export const ExitModal = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { isOpen, close } = useExitModal();

  useEffect(() => setIsClient(true), []);

  if (!isClient) return null;

  const handleExit = () => {
    close();
    router.push("/student/dashboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-md rounded-2xl px-4 py-2 overflow-hidden">
        <DialogHeader className="px-6 pt-8 pb-4">
          <div className="mb-6 flex w-full items-center justify-center">
            <Image
              src="/images/character/lila-sad.png"
              alt="Lila is sad"
              height={140}
              width={140}
              className="object-contain"
            />
          </div>

          <DialogTitle className="text-center text-2xl font-bold text-gray-900">
            Wait, don&apos;t go!
          </DialogTitle>

          <DialogDescription className="text-center text-base text-gray-600 mt-2 px-4">
            You&apos;re about to leave the lesson. All progress in this session
            will be lost.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="px-6 pb-6 pt-2 flex-col gap-3 sm:flex-col">
          <Button
            variant="primary"
            className="w-full h-12 text-base font-semibold"
            size="lg"
            onClick={close}
          >
            Keep Learning
          </Button>

          <Button
            variant="dangerOutline"
            className="w-full h-12 text-base font-semibold"
            size="lg"
            onClick={handleExit}
          >
            End Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
