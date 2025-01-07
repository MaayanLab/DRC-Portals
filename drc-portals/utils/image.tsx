'use client'
import React from "react";
import NextImage from "next/image";

export { type StaticImageData } from 'next/image'

export default function Image({ optimized = false, ...props }: React.ComponentProps<typeof NextImage> & {optimized?: boolean}) {
  return <NextImage
    unoptimized={props.unoptimized !== undefined ? props.unoptimized : !optimized}
    {...props}
  />
}
