import { redirect } from "next/navigation";

export default async function Page(props: {}) {
  redirect(`/data/processed`)
}
