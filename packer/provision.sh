#!/usr/bin/env bash

#  this command updates all packages to the latest version
sudo yum update -y 

#Installing mysql server
sudo yum install -y https://dev.mysql.com/get/mysql80-community-release-el7-5.noarch.rpm

sudo yum install -y mysql

sudo systemctl start mysqld
sudo systemctl enable mysqld

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

# Install nginx
sudo amazon-linux-extras list | grep nginx
sudo amazon-linux-extras enable nginx1
sudo yum clean metadata
sudo yum -y install nginx
sudo systemctl enable nginx