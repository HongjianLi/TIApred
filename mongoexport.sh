#!/usr/bin/env bash
mongoexport --db predTIA --collection records --type csv --fieldFile fieldFileRecords | awk -F, '{if (NR==1) { for (i=1;i<NF;++i) printf "%s.string(),",$i; printf "%s.string()\n",$i; } else print $0;}' > records.csv
