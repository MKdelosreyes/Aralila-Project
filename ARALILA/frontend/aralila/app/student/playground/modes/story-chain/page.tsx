import React, { Suspense } from "react";
import StoryChainLanding from "./StoryChainLanding.client";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <StoryChainLanding />
    </Suspense>
  );
}
