#!/bin/bash 
##SBATCH --partition=platinum
#SBATCH --partition=condo
#SBATCH --nodes=1 
#SBATCH --ntasks-per-node=4
#SBATCH --mem=256
#SBATCH --time=24:00:00 
#SBATCH --account=sds195
##SBATCH --qos=hcp-sds195
#SBATCH --qos=condo
#SBATCH -o slurm-%j-zz02.out-%N
#SBATCH -e slurm-%j-zz02.err-%N
#SBATCH --mail-type END
#SBATCH --mail-user mmaurya@ucsd.edu

# Load Python module (adjust as necessary for your setup) 
#module load python3

# Execute the program
cd /tscc/lustre/ddn/scratch/mano/external-CV-reference-scripts/PubChem-Nov-2024
./zz02_seed_substance_TSV.pl < /dev/null > log/zz02_seed_substance_TSV.pl.out 2> log/zz02_seed_substance_TSV.pl.err

# To submit this batch job on TSCC, do
#sbatch run_on_TSCC_zz02_seed_substance_TSV.sh 

# https://www.sdsc.edu/support/user_guides/tscc.html#job_status
# Command to check running jobs by the user
# squeue -u $USER

# Other commands
#sacctmgr show assoc user=$USER format=account,user
# By allocation
#squeue -A sds195
# By node:
#squeue -w tscc-13-9

