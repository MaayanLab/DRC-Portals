c2m2_json_f1 = "C2M2_datapackage.json";
c2m2_json_f2 = "C2M2_datapackage_utf8.json";
c2m2_json_f3 = "C2M2_datapackage_wo_explicit_utf8.json";

library(jsonlite); 
j1 = fromJSON(c2m2_json_f1, simplifyVector = FALSE);
j2 = fromJSON(c2m2_json_f2, simplifyVector = FALSE);
j3 = fromJSON(c2m2_json_f3, simplifyVector = FALSE);
j1j2_true = isTRUE(all.equal(j1,j2))
j1j3_true = isTRUE(all.equal(j1,j3))
j2j3_true = isTRUE(all.equal(j2,j3))


# > names(j2$resources[[1]])
# [1] "profile"     "name"        "title"       "path"        "dialect"    
# [6] "description" "schema"      "encoding"   
# > names(j1$resources[[1]])
# [1] "profile"     "name"        "title"       "path"        "dialect"    
#[6] "description" "schema"     

# More detailed appraoch, to check after adding field encoding = utf-8

library(waldo)

# Remove encoding field from each resource entry
remove_encoding <- function(x) {

  x$resources <- lapply(
    x$resources,
    function(y) {

      y$encoding <- NULL

      y
    }
  )

  x
}

# Clean updated object
j2_clean <- remove_encoding(j2)

# Compare objects
compare(j1, j2_clean, max_diffs = Inf)

# Optional strict equality check
identical(j1, j2_clean)

# Optional readable equality check
all.equal(j1, j2_clean)

