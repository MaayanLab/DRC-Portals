# DRC-Portal - C2M2 branch

<https://info.cfde.cloud/> <=> /info  
<https://data.cfde.cloud/> <=> /data  

## Getting Started

- [DRC Portals Dev Guide](./drc-portals/README.md)
- [Database Provisioning Guide](./database/README.md)

## To safely merge recent changes at main into our local repo
git fetch origin main
git merge origin/main

## To push these changes to the C2M2 branch of the GitHub repo
git status
### if not already pointing to C2M2, do
git checkout C2M2
### Make sure, head is C2M2, then
git push # or?: git add * && git commit -m 'Some message' && git push
