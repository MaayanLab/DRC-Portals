import Publications from "@/components/misc/Publications/PublicationsServer"

export default function PublicationPage ({searchParams}:{
    searchParams?: {
        q?:string
    }
}) {
    return <Publications all={true} searchParams={searchParams}/>
}
