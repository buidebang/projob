#!/bin/bash
sudo apt-get update && sudo apt-get install -y postgresql
sudo service postgresql start
sudo -u postgres psql -c "CREATE USER jules WITH PASSWORD 'jules';"
sudo -u postgres psql -c "CREATE DATABASE mydb;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mydb TO jules;"
sudo -u postgres psql -c "ALTER DATABASE mydb OWNER TO jules;"
