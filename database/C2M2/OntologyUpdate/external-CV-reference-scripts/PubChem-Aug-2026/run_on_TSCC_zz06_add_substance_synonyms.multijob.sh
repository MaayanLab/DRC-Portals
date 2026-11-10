#!/bin/bash 
### To check which account and qos are available for the account
### tscc_client -u mano
###
###---------------------------
#SBATCH --partition=platinum
#SBATCH --qos=hcp-sds195
##
##SBATCH --partition=condo
##SBATCH --qos=condo
##
#SBATCH --account=sds195
###---------------------------
##SBATCH --partition=hotel
##SBATCH --qos=hotel
##SBATCH --account=htl153
###---------------------------
#SBATCH --mem=256G
##SBATCH --mem=180G
#SBATCH --nodes=1
#SBATCH --ntasks-per-node=48
#SBATCH --time=24:00:00 
#SBATCH -o slurm-%j-zz06.multijob.out-%N
#SBATCH -e slurm-%j-zz06.multijob.err-%N
#SBATCH --mail-type END
#SBATCH --mail-user mmaurya@ucsd.edu

#############
# There are limits on max RAM and ntasks-per-node based on Partition
# https://www.sdsc.edu/systems/tscc/user_guide.html#narrow-wysiwyg-6
#Partition 	Max CPU per Node	Max memory (GB) in --mem
#hotel 		28			187
#condo 		64			1007
#gold 		36			251
#platinum 	64			1007
#############

# Check by: squeue -A sds195 OR squeue -A htl153 to see what is already running on our node, then check job details of those by
# scontrol show job <job_id>
# To cancel a job
# scancel <job_id>
# then decide how many cores and RAM to request so that total is not exceeded (e.g., 64 cores and 1024 GB RAM)
# Try first as others seem to not run anyway
##SBATCH --partition=platinum
##SBATCH --qos=hcp-sds195

## mem is in MB if no G or GB specified

# Load Python module (adjust as necessary for your setup) 
#module load python3

# Execute the program
cd /tscc/lustre/ddn/scratch/mano/external-CV-reference-scripts/PubChem-Aug-2026
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

