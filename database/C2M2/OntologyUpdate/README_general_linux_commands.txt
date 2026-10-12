# Mano: 2024/11/22:

###############################################################
To make drc as the group; also as default for new

chgrp -R drc *

To give write permission to drc

chmod -R g+w *

For future files/folders:
# More info: https://stackoverflow.com/questions/9129959/how-to-set-a-file-to-this-drwxrwsrwx-permission-on-ubuntu
[
The group owner permissions in your example are rws, which means that the group owner has read, write, and execute process AND the object has the setguid bit set (this is the s in rws). On a file, the setgid bit means that, if the file were executed, that it would be run with the effective rights of the group owner (instead of that of the user who executed it). On a directory, the setgid bit means that, if a file is created in the directory, its group-owner would be that of the directory (instead of that of the user who created it).
]
find . -type d -exec chmod g+s {} +
###############################################################

