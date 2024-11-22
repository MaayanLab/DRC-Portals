'use client'
import React from "react";
import NextLink from "next/link";
import { sendGAEvent } from "@next/third-parties/google";

export default function Link({ prefetch = false, onClick, ...props }: React.ComponentProps<typeof NextLink>) {
  return <NextLink
    prefetch={prefetch}
    onClick={evt => {
      if (props.target === '_blank') sendGAEvent('event', 'click', { value: props.href })
      if (onClick) onClick(evt)
    }}
    {...props}
  />
}
