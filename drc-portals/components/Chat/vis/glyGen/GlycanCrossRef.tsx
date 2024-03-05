
export function GlycanCrossRef({ crossref }: {crossref: any}) {
    const pubMedCrossRefs = crossref.filter((entry: any) => 
      ['PubChem Compound', 'PubChem Substance'].includes(entry.database) && entry.url
    )
  
    if (pubMedCrossRefs.length === 0) {
      return null
    }
  
    return (
      <div className="prose text-white">
        {pubMedCrossRefs.map((entry: any) => (
          <div key={entry.id}>
            <b>{entry.database}: </b>
            <a href={entry.url} target='_blank' rel='noopener noreferrer' style={{color: 'blue'}}>
              <u style={{color: 'blue'}}>{entry.id}</u>
            </a>
          </div>
        ))}
      </div>
    ) 
  
  }