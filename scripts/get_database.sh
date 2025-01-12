#! /bin/bash

# clean up the old database
rm -f zxdb.sqlite

rm -rf zxdb

# create a folder for the repo if it doesn't exist
mkdir -p zxdb

# make sure it contains a .gitignore file
touch zxdb/.gitignore

cd zxdb

# clone the repo for zxdb into a temp directory - do a shallow clone
git clone --depth 1 https://github.com/zxdb/ZXDB.git 

# navigate to the zxdb directory
cd ZXDB

# unzip the mysql database
unzip ZXDB_mysql.sql.zip

# run the script to generate the sqlite database
python3 scripts/ZXDB_to_SQLite.py

# copy the sqlite database to the current directory
sqlite3 ../../zxdb.sqlite < ZXDB_sqlite.sql

cd ../..

# clean up the temp directory
rm -rf zxdb
