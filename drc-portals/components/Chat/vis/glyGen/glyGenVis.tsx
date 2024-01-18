    
import { GlycanClassification } from "./GlycanClassification"
import { GlycanCrossRef } from "./GlycanCrossRef"
    
export default function GlyGenVis({data}: {data: any}) {

    const glyGenLink = `http://www.glygen.org/glycan/${data.glytoucan.glytoucan_ac}`

    return (
      <div className="prose text-white">
        <div>GlyTouCan Accession: 
          <b>
            <a href={glyGenLink} target='_blank' rel='noopener nonreferrer' style={{color: 'blue'}}> <u style={{color: 'blue'}}>{data.glytoucan.glytoucan_ac}</u></a>
          </b>
        </div>
        <div>Monoisotopic Mass: <b>{data.mass} Da</b></div>
        <div>Monoisotopic Mass-pMe (Da): <b>{data.mass_pme} Da</b></div>
        <div>
          Glycan Type / Glycan Subtype: <b><GlycanClassification classification={data.classification}/></b>
        </div>
        <div>
          <GlycanCrossRef crossref={data.crossref}/>
        </div>
        <div>
          Glycan Image: 
          <img src={`https://api.glygen.org/glycan/image/${data.glytoucan.glytoucan_ac}/`} alt='Glycan Image'/>
        </div>
      </div>
    )
}