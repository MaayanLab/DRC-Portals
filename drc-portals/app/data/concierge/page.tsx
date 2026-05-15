import { Grid, Typography, Button, Link } from "@mui/material";
import Icon from '@mdi/react';
import { mdiAccountGroup, mdiDna, mdiEmoticonSick, mdiEyedropper, mdiFlask, mdiHumanMaleHeight, mdiListBox, mdiMolecule, mdiPill, mdiRecordCircleOutline, mdiVirus } from '@mdi/js';
const inputs = [
	{
		inputType: "CFDE",
		text: "CFDE Related Question",
		icon: mdiAccountGroup
	},
	{
		inputType: "Gene",
		text: "Gene",
		icon: mdiDna
	},
	{
		inputType: "GeneSet",
		text: "Gene Set",
		icon: mdiListBox
	},
	{
		inputType: "Glycan",
		text: "Glycan",
		icon: mdiMolecule
	},
	{
		inputType: "Phenotype",
		text: "Phenotype",
		icon: mdiHumanMaleHeight
	},
	{
		inputType: "Small Molecule",
		text: "Small Molecules",
		icon: mdiPill
	},
	{
		inputType: "Disease",
		text: "Disease",
		icon: mdiEmoticonSick
	},
	{
		inputType: "Pathogen",
		text: "Pathogen",
		icon: mdiVirus
	},
	{
		inputType: "Metabolite",
		text: "Metabolite",
		icon: mdiEyedropper
	},
	{
		inputType: "Cell Line",
		text: "Cell Line",
		icon: mdiRecordCircleOutline
	},
	{
		inputType: "Assay",
		text: "Assay",
		icon: mdiFlask
	}
]
export default function Concierge({}) {
  return (
	<Grid container spacing={2}>
	  {inputs.map(input=>(
		<Grid item xs={6} md={4} key={input.inputType}>
			<Link href={`/data/concierge/${input.inputType}`}>
				<Button disabled={['Gene', "Phenotype", 'Glycan', 'CFDE'].indexOf(input.inputType) === -1} sx={{width: "100%", justifyContent: "flex-start" }} color="secondary" variant="outlined" startIcon={<Icon path={input.icon} size={3}/>}>
					<Typography variant="h4">{input.text}</Typography>
				</Button>
			</Link>
		</Grid>
	  ))}
	</Grid>
  );
}
