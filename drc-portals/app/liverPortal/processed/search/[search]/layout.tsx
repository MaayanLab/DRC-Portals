import React from 'react'
import { redirect } from 'next/navigation'
import { categoryLabel } from '@/app/data/processed/utils'
import { FancyTab } from '@/components/misc/FancyTabs'
import SearchTabs from '@/app/data/processed/SearchTabs'
import trpc from '@/lib/trpc/server'
import { safeAsync } from '@/utils/safe'
import { TRPCError } from '@trpc/server'

export default async function LiverSearchLayout(props: React.PropsWithChildren<{ params: Promise<{ search: string }> }>) {
    const params = await props.params
    const search = decodeURIComponent(params.search)
    const liverSearch = search.includes('liver') ? search : `${search} liver`

    const searchRes = await safeAsync(() => trpc.types({ search: liverSearch }))
    if (!searchRes.data) redirect('/liverPortal')

    return (
        <SearchTabs>
            <FancyTab
                id={""}
                label={<>Processed Data<br />{Number(searchRes.data.total).toLocaleString()}</>}
                priority={Number(searchRes.data.total)}
            />
            {searchRes.data.types?.map((filter) =>
                <FancyTab
                    key={filter.key}
                    id={filter.key}
                    label={<>{categoryLabel(filter.key)}<br />{Number(filter.doc_count).toLocaleString()}</>}
                    priority={Number(filter.doc_count)}
                />
            )}
            {props.children}
        </SearchTabs>
    )
}