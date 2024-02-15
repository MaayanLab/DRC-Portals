interface HashTable {
    [key: string]: string;
}
const dccIconTable: HashTable = {};
dccIconTable["4DN"] = "/img/4DN.png";
dccIconTable["ERCC"] = "/img/exRNA.png";
dccIconTable["GTEx"] = "/img/GTEx.png";
dccIconTable["GlyGen"] = "/img/glygen-2023-workshop.png";
dccIconTable["HMP"] = "/img/HMP.png";
dccIconTable["HuBMAP"] = "/img/HuBMAP.png";
dccIconTable["IDG"] = "/img/IDG.png ";
dccIconTable["KFDRC"] = "/img/KOMP2.png";
dccIconTable["LINCS"] = "/img/LINCS.gif";
dccIconTable["MW"] = "/img/Metabolomics.png";
dccIconTable["MoTrPAC"] = "/img/MoTrPAC.png";
dccIconTable["SPARC"] = "/img/SPARC.svg";

export function getDCCIcon(iconKey: string | undefined): string | undefined {
    if (iconKey && dccIconTable.hasOwnProperty(iconKey)) {
        return dccIconTable[iconKey];
    } else {
        return "";
    }
}