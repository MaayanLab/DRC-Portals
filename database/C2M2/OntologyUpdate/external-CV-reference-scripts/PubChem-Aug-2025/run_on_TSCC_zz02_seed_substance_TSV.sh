#!/bin/bash 
##SBATCH --partition=platinum
##SBATCH --qos=hcp-sds195
##SBATCH --partition=condo
##SBATCH --qos=hotel
#SBATCH --partition=hotel
#SBATCH --qos=condo
#SBATCH --nodes=1 
#SBATCH --ntasks-per-node=4
#SBATCH --mem=150G
#SBATCH --time=24:00:00 
#SBATCH --account=sds195
#SBATCH -o slurm-%j-zz02.out-%N
#SBATCH -e slurm-%j-zz02.err-%N
#SBATCH --mail-type END
#SBATCH --mail-user mmaurya@ucsd.edu

# Check by: squeue -A sds195 to see what is already running on our node, then check job details of those by
# scontrol show job <job_id>
# then decide how many cores and RAM to request so that total is not exceeded (e.g., 64 cores and 1024 GB RAM)
# Try first as others seem to not run anyway
##SBATCH --partition=platinum
##SBATCH --qos=hcp-sds195

## mem is in MB if no G or GB specified

# Load Python module (adjust as necessary for your setup) 
#module load python3

# Execute the program
cd /tscc/lustre/ddn/scratch/mano/external-CV-reference-scripts/PubChem-Aug-2025
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

