import News from "./NewsServer"

export default async function NewsPage (props:{
    searchParams?: Promise<{
        q?:string
    }>
}) {
    return <News searchParams={props.searchParams}/>
}
