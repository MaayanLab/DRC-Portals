#!/bin/bash 
#SBATCH --partition=condo
##SBATCH --partition=platinum
#SBATCH --nodes=1
#SBATCH --ntasks-per-node=64
##SBATCH --mem=512
#SBATCH --mem=1024
#SBATCH --time=02:00:00 
#SBATCH --account=sds195
#SBATCH --qos=condo
##SBATCH --qos=hcp-sds195
#SBATCH -o slurm-%j-zz06.multijob.out-%N
#SBATCH -e slurm-%j-zz06.multijob.err-%N
#SBATCH --mail-type END
#SBATCH --mail-user mmaurya@ucsd.edu

# Load Python module (adjust as necessary for your setup) 
#module load python3

# Execute the program
cd /tscc/lustre/ddn/scratch/mano/external-CV-reference-scripts/PubChem-Nov-2024
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

