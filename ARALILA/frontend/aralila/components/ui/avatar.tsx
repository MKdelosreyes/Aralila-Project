<<<<<<< HEAD
"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";
=======
"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"
>>>>>>> c61a561f516f1fb0621ba6fa989a28c86aa16d7c

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
<<<<<<< HEAD
        "relative flex size-11 shrink-0 overflow-hidden rounded-full",
=======
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
>>>>>>> c61a561f516f1fb0621ba6fa989a28c86aa16d7c
        className
      )}
      {...props}
    />
<<<<<<< HEAD
  );
=======
  )
>>>>>>> c61a561f516f1fb0621ba6fa989a28c86aa16d7c
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
<<<<<<< HEAD
  );
=======
  )
>>>>>>> c61a561f516f1fb0621ba6fa989a28c86aa16d7c
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
<<<<<<< HEAD
  );
}

export { Avatar, AvatarImage, AvatarFallback };
=======
  )
}

export { Avatar, AvatarImage, AvatarFallback }
>>>>>>> c61a561f516f1fb0621ba6fa989a28c86aa16d7c
