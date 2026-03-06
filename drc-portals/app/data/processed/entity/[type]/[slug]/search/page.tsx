import { create_url } from "@/app/data/processed/utils";
import { redirect } from "next/navigation";

export default async function Page(props: { params: Promise<{ type: string, slug: string } & Record<string, string>>, searchParams?: Promise<{ [key: string]: string[] | string | undefined }> }) {
  const params = await props.params
  redirect(create_url({ type: params.type, slug: params.slug }))
}
