import Outreach from "@/components/misc/Outreach";

export default function OutreachPage ({ searchParams }: {
    searchParams?: {tag: string}
}) {
    return <Outreach searchParams={searchParams} featured={false}/>
}