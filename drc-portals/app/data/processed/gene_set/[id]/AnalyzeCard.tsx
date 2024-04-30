import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import modules from "./modules";
import { $Enums} from "@prisma/client";

export function AnalyzeCard ({item, genes} : {item: 
    {
    gene_set_library: {
        id: string;
        node: {
            label: string;
            type: $Enums.NodeType;
            description: string;
        };
    };
    _count: {
        genes: number;
    };    
    node: {
        type: $Enums.NodeType;
        label: string;
        dcc: { label: string; short_label: string | null; icon: string | null; } | null;
        description: string;
    };
}, genes: {
    genes: {
        id: string;
        entity: {
            node: {
                type: $Enums.NodeType;
                label: string;
                description: string;
            };
        };
    }[];
    _count: {
        genes: number;
    };
}
}) {
    return (
        <Grid container sx={{paddingTop: 5, paddingBottom: 5}}>
        <Grid item xs={12} sx={{marginBottom: 5}}>
          <Typography variant="h2" color="secondary">Analyze</Typography>
        </Grid>
        <Grid item xs={12} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modules
            .map(({ button: ModButton }, i) => <ModButton key={i} item={item}  genes={genes}/>)}
        </Grid>
      </Grid>
    )
}


