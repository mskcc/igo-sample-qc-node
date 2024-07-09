# igo-sample-qc-node
The Sample QC web app is the interface between IGO and users for sharing QC stats of samples at various stages of prep 
and to gather user decisions about their status. It has a nodejs backend deployed on an Open Systems VM running red hat linux 7. 
Comment relation, comments, decisions, and sqluser models stored in separate sql DB (MariaDB) on VM. Index and User models stored in LIMSDB
