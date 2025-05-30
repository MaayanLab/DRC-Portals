import prisma from "@/lib/prisma";
import { DCC } from "@prisma/client";

import InteractiveNavModal from "./modal";
import InteractiveNavComponent from "./interactive";


const InteractiveNav = async ({fab}: {fab?: boolean}) => {
	const dccs = await prisma.dCC.findMany({
		where: {
			cfde_partner: true,
			active: true
		}
	})
	return (
		<InteractiveNavModal fab={fab}>
			<InteractiveNavComponent dccs={dccs}/>
		</InteractiveNavModal>
	)
}

export default InteractiveNav