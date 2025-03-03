import News from "./NewsServer"

export default function NewsPage ({searchParams}:{
    searchParams?: {
        q?:string
    }
}) {
    return <News searchParams={searchParams}/>
}
