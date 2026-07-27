import Publications from "./PublicationsServer"

export default async function PublicationPage (props:{
    searchParams?: Promise<{
        q?:string
    }>
}) {
    return <Publications searchParams={props.searchParams}/>
}
