import prisma from "@/lib/prisma";
import { Typography } from "@mui/material";
import R03Component from "@/components/misc/R03/R03Component";

export default async function R03Page() {

    const R03 = await prisma.r03.findMany({
        orderBy: {
            end_date: 'desc'
        },
        include: {
            publications: {
                include: {
                    publication: true
                }
            }
        }
    });
    return (
        <div>
            <Typography variant="h2" color="secondary">R03s: Pilot Projects Enhancing Utility and Usage of Common Fund Data Sets </Typography>
            <div className="mt-3 mb-8">
                <Typography variant="subtitle1" color="secondary">
                    The Common Fund supports small research projects (R03) encouraging the use of Common Fund data sets. The projects intend to enable novel and compelling biological questions to be formulated and addressed, and/or to generate cross-cutting hypotheses for future research.
                </Typography>
            </div>
            <R03Component r03={R03} />
        </div>
    );
}
