import { redirect } from "next/navigation";

export default async function Page(props: { params: Promise<{ type: string } & Record<string, string>>, searchParams?: Promise<{ [key: string]: string[] | string | undefined }> }) {
  const params = await props.params
  redirect(`/data/processed2/${encodeURIComponent(params.type as string)}/search`)
}