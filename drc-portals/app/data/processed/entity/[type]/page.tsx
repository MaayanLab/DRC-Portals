import { redirect } from "next/navigation";
import { create_url } from "@/app/data/processed/utils";

export default async function Page(props: { params: Promise<{ type: string } & Record<string, string>>, searchParams?: Promise<{ [key: string]: string[] | string | undefined }> }) {
  const params = await props.params
  redirect(create_url({ type: params.type }))
}
