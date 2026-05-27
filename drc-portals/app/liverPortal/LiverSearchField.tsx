'use client'
import React from "react"
import { SearchField } from "@/app/data/processed/SearchField"
import { useRouter } from "@/utils/navigation"
import { parse_url } from "@/app/data/processed/utils"

export function LiverSearchForm({ children, name }: React.PropsWithChildren<{ name: string }>) {
    const router = useRouter()
    return (
        <form onSubmit={evt => {
            evt.preventDefault()
            const formData = new FormData(evt.currentTarget)
            const value = formData.get(name)
            const search = value ? `${value.toString()} liver` : 'liver'
            router.push(`/liverPortal/search/${encodeURIComponent(search)}`)
        }}>
            {children}
            <input className="hidden" type="submit" />
        </form>
    )
}

export function LiverSearchField({ name = 'search' }: { name?: string }) {
    const id = React.useId()
    return (
        <LiverSearchForm name={id}>
            <SearchField
                name={id}
                defaultValue=""
                placeholder="Search liver data..."
                autocomplete={{}}
                InputProps={{
                    sx: { width: { xs: '200px', md: '270px' } }
                }}
            />
        </LiverSearchForm>
    )
}