import Publications from "@/components/misc/Publications/PublicationsServer"
import { Prisma } from "@prisma/client"
export default function PublicationPage ({searchParams={
    take: "10",
    skip: "0"
}}: {
    searchParams?: {
        take?:string,
        skip?: string,
        order?: {
            field: Prisma.PublicationScalarFieldEnum, 
            ordering: 'asc'|'desc'
        },
        where?: Prisma.PublicationWhereInput,
    }
}) {
    return <Publications all={true}
        searchParams={searchParams}
    />
}