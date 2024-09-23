import { Metadata, ResolvingMetadata } from "next";

import GraphSearchLayout from "./GraphSearchLayout";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const parentMetadata = await parent;

  return {
    title: `${parentMetadata.title?.absolute} | Graph Search${
      searchParams.q === undefined ? "" : ` ${searchParams.q}`
    }`,
  };
}

export default async function Page() {
  return <GraphSearchLayout />;
}
