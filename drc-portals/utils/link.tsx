import React from "react";
import NextLink from "next/link";

export default function Link({ prefetch = false, ...props }: React.ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={prefetch} {...props} />
}
