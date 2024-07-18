export const join_query = (query:object) => {
    const query_list = Object.entries(query).map(([k,v]:[k:string, v:string|number])=>(
        `${k}=${v}`
    ))
    return query_list.join("&")
}