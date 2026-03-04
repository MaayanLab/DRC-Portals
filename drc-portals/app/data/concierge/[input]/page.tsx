'use client'
import { Grid, Typography, Avatar, Stack, Card, CardMedia, CardContent, Button, Collapse, CardHeader, IconButton } from "@mui/material";
import Link from "@/utils/link";
import Icon from '@mdi/react';
import { mdiAccountGroup, mdiDna, mdiEmoticonSick, mdiFlask, mdiHumanMaleHeight, mdiListBox, mdiMolecule, mdiPagePrevious, mdiPill, mdiRecordCircleOutline, mdiRoomService, mdiVirus } from '@mdi/js';
import GeneInput from "./geneInput";
import GlycanInput from "./glycanInput";
import PhenotypeInput from "./phenotypeInput";
import CFDEInput from "./CFDEInput";

const inputs = [
	{
		inputType: "CFDE",
		text: "CFDE Related Question",
		icon: mdiAccountGroup,
		component: CFDEInput
	},
	{
		inputType: "Gene",
		text: "Gene",
		icon: mdiDna,
		component: GeneInput
	},
	{
		inputType: "GeneSet",
		text: "Gene Set",
		icon: mdiListBox,
		component: GeneInput
	},
	{
		inputType: "Glycan",
		text: "Glycan",
		icon: mdiMolecule,
		component: GlycanInput
	},
	{
		inputType: "Phenotype",
		text: "Phenotype",
		icon: mdiHumanMaleHeight,
		component: PhenotypeInput
	},
	{
		inputType: "Small Molecule",
		text: "Small Molecules",
		icon: mdiPill,
		component: GeneInput
	},
	{
		inputType: "Disease",
		text: "Disease",
		icon: mdiEmoticonSick,
		component: GeneInput
	},
	{
		inputType: "Pathogen",
		text: "Pathogen",
		icon: mdiVirus,
		component: GeneInput
	},
	{
		inputType: "Cell Line",
		text: "Cell Line",
		icon: mdiRecordCircleOutline,
		component: GeneInput
	},
	{
		inputType: "Assay",
		text: "Assay",
		icon: mdiFlask,
		component: GeneInput
	}
]

export default function ConciergeInput({params}: {
	params: {
		input: string
	}
}) {
	const inps = inputs.filter(i=>i.inputType === params.input)
	if (inps.length === 0) return null
	const input = inps[0]
	return input.component({input})
}
