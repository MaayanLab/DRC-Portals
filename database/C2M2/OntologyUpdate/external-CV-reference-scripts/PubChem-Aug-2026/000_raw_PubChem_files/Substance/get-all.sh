#!/bin/tcsh

wget -nc "ftp://ftp.ncbi.nlm.nih.gov/pubchem/Substance/CURRENT-Full/XML/Substance_*" |& cat > wget.err 
