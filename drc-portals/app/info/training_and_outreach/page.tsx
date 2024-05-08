import Outreach from "@/components/misc/Outreach";
import { redirect } from "next/navigation";

export default function OutreachPage ({ searchParams }: {
    searchParams?: {
        filter?: string
    }
}) {
    return <Outreach searchParams={searchParams} featured={false}/>
}