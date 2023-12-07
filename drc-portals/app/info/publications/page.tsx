import Publications from "./PublicationsServer"

export default function PublicationPage ({searchParams}:{
    searchParams?: {
        q?:string
    }
}) {
    return <Publications searchParams={searchParams}/>
}
