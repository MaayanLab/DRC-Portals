#!/bin/bash 
#SBATCH --partition=condo
##SBATCH --partition=platinum
#SBATCH --nodes=1 
#SBATCH --ntasks-per-node=4
#SBATCH --mem=256
#SBATCH --time=48:00:00 
#SBATCH --account=sds195
#SBATCH --qos=condo
##SBATCH --qos=hcp-sds195
#SBATCH -o slurm-%j-zz06.LOCAL.out-%N
#SBATCH -e slurm-%j-zz06.LOCAL.err-%N
#SBATCH --mail-type END
#SBATCH --mail-user mmaurya@ucsd.edu

# Load Python module (adjust as necessary for your setup) 
#module load python3

# Execute the program
cd /tscc/lustre/ddn/scratch/mano/external-CV-reference-scripts/PubChem-Nov-2024
./zz06_add_substance_synonyms.LOCAL.pl < /dev/null > log/zz06_add_substance_synonyms.LOCAL.pl.out 2> log/zz06_add_substance_synonyms.LOCAL.pl.err

# To submit this batch job on TSCC, do
#sbatch run_on_TSCC_zz06_add_substance_synonyms.LOCAL.sh 

# https://www.sdsc.edu/support/user_guides/tscc.html#job_status
# Command to check running jobs by the user
# squeue -u $USER

# Other commands
#sacctmgr show assoc user=$USER format=account,user
# By allocation
#squeue -A sds195
# By node:
#squeue -w tscc-13-9

