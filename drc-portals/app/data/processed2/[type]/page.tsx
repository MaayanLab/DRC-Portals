import { redirect } from "next/navigation";

export default async function Page(props: { params: Promise<{ type?: string, search?: string, search_type?: string } & Record<string, string>>, searchParams?: Promise<{ [key: string]: string[] | string | undefined }> }) {
  const params = await props.params
  redirect(`/data/processed2/${encodeURIComponent(params.type as string)}/search`)
}