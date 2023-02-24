#!/usr/bin/env bash

#  this command updates all packages to the latest version
sudo yum update -y 

#Installing mysql server
sudo yum install -y https://dev.mysql.com/get/mysql80-community-release-el7-5.noarch.rpm

sudo yum install -y mysql-community-server

sudo systemctl start mysqld
sudo systemctl enable mysqld

passwords=$(sudo grep 'temporary password' /var/log/mysqld.log | awk {'print $13'})

mysql -u root -p$passwords --connect-expired-password -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'Aditya@123';"

mysql -u root -pAditya@123 -e "create database cloud;"


# cmd to install node verson 16
sudo yum install -y curl
curl -sL https://rpm.nodesource.com/setup_16.x | sudo -E bash -
sudo yum install -y nodejs

node -e "console.log('Running Node.js ' + process.version)"


# Install requirements
cd /home/ec2-user/webapp
sudo npm install -g nodemon
npm uninstall bcrypt
npm install bcrypt

cd ..
sudo chmod 755 webapp
touch webapp.service
cat <<EOF >> webapp.service
[Unit]
Description=app.js - making your environment variables rad
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/webapp
ExecStart=/usr/bin/node /home/ec2-user/webapp/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
sudo mv webapp.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl restart webapp.service
sudo systemctl enable webapp.service
sudo systemctl status webapp.service


# Install nginx
sudo amazon-linux-extras list | grep nginx
sudo amazon-linux-extras enable nginx1
sudo yum clean metadata
sudo yum -y install nginx
sudo systemctl enable nginx
