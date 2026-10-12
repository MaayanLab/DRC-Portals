#!/bin/bash 
##SBATCH --partition=condo
##SBATCH --qos=condo
##SBATCH --mem=256G
#SBATCH --partition=platinum
#SBATCH --qos=hcp-sds195
#SBATCH --mem=240G
#SBATCH --nodes=1
#SBATCH --ntasks-per-node=36
#SBATCH --time=08:00:00 
#SBATCH --account=sds195
#SBATCH -o slurm-%j-zz06.multijob.out-%N
#SBATCH -e slurm-%j-zz06.multijob.err-%N
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
./zz06_add_substance_synonyms.multijob.pl < /dev/null > log/zz06_add_substance_synonyms.multijob.pl.out 2> log/zz06_add_substance_synonyms.multijob.pl.err

# sleep for sometime
sleep 60;

# To submit this batch job on TSCC, do
#sbatch run_on_TSCC_zz06_add_substance_synonyms.multijob.sh 

# https://www.sdsc.edu/support/user_guides/tscc.html#job_status
# Command to check running jobs by the user
# squeue -u $USER

# Other commands
#sacctmgr show assoc user=$USER format=account,user
# By allocation
#squeue -A sds195
# By node:
#squeue -w tscc-13-9
# While a job is running on a node, the user can login to that simply by:
# ssh $USER@NODENAME # no password asked

