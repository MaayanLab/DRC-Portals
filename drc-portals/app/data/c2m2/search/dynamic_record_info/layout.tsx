

export default function RecordInfoLayout({
    children,
    metadataQuery,
    biosamples,
    collections
}: {
    children: React.ReactNode;
    metadataQuery: React.ReactNode;
    biosamples: React.ReactNode;
    collections: React.ReactNode;
}) {
    return (
        <>
            <div>{children}</div>
            <div>{metadataQuery}</div>
            <div>{biosamples}</div>
            <div>{collections}</div>

        </>
    );
}