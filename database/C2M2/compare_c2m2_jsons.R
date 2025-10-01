c2m2_json_f1 = "C2M2_datapackage.json";
c2m2_json_f2 = "C2M2_datapackage_PTM.json";
c2m2_json_f3 = "updated_0515.json";

library(jsonlite); 
j1 = fromJSON(c2m2_json_f1, simplifyVector = FALSE);
j2 = fromJSON(c2m2_json_f2, simplifyVector = FALSE);
j3 = fromJSON(c2m2_json_f3, simplifyVector = FALSE);
j1j2_true = isTRUE(all.equal(j1,j2))
j1j3_true = isTRUE(all.equal(j1,j3))
j2j3_true = isTRUE(all.equal(j2,j3))

