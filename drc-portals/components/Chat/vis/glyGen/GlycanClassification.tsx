export function GlycanClassification({ classification }: { classification: any }) {
    return (
      classification.map((entry: any) => 
        `${entry.type.name} / ${entry.subtype.name}`
      ).join(' | ')
    )
}
