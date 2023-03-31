#!/usr/bin/env bash

#  this command updates all packages to the latest version
sudo yum update -y 

#Installing mysql server
# sudo yum install -y https://dev.mysql.com/get/mysql80-community-release-el7-5.noarch.rpm

# sudo yum install -y mysql-community-server

sudo yum install -y mysql

sudo curl -o ./amazon-cloudwatch-agent.rpm https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm

sudo rpm -U amazon-cloudwatch-agent.rpm 

touch cloudwatch-config.json

sudo cat <<EOF > cloudwatch-config.json
{
  "agent": {
      "metrics_collection_interval": 10,
      "logfile": "/var/logs/amazon-cloudwatch-agent.log"
  },
  "logs": {
      "logs_collected": {
          "files": {
              "collect_list": [
                  {
                      "file_path": "/home/ec2-user/webapp/logs/csye6225.log",
                      "log_group_name": "csye6225",
                      "log_stream_name": "webapp"
                  }
              ]
          }
      },
      "log_stream_name": "cloudwatch_log_stream"
  },
  "metrics":{
    "metrics_collected":{
       "statsd":{
          "service_address":":8125",
          "metrics_collection_interval":15,
          "metrics_aggregation_interval":60
       }
    }
 }

}
EOF

sudo mv cloudwatch-config.json /opt/aws/amazon-cloudwatch-agent/bin/

sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/opt/aws/amazon-cloudwatch-agent/bin/cloudwatch-config.json \
    -s

# sudo systemctl start mysqld
# sudo systemctl enable mysqld

# passwords=$(sudo grep 'temporary password' /var/log/mysqld.log | awk {'print $13'})

# mysql -u root -p$passwords --connect-expired-password -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'Abhi@123';"

# mysql -u root -pAbhi@123 -e "create database menagerie;"


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

# touch webapp.service
# cat <<EOF >> webapp.service
# [Unit]
# Description=app.js - making your environment variables rad
# After=network.target

# [Service]
# Type=simple
# User=ec2-user
# WorkingDirectory=/home/ec2-user/webapp
# ExecStart=/usr/bin/node /home/ec2-user/webapp/index.js
# Restart=on-failure

# [Install]
# WantedBy=multi-user.target
# EOF
# sudo mv webapp.service /etc/systemd/system/
# sudo systemctl daemon-reload
# sudo systemctl restart webapp.service
# sudo systemctl enable webapp.service
# sudo systemctl status webapp.service


# # webapp system service
# sudo cp packer/webapp.service /etc/systemd/system/
# sudo systemctl daemon-reload
# sudo systemctl enable webapp.service
# sudo systemctl start webapp.service

# Install nginx
sudo amazon-linux-extras list | grep nginx
sudo amazon-linux-extras enable nginx1
sudo yum clean metadata
sudo yum -y install nginx
sudo systemctl enable nginx
# sudo cp packer/nginx.conf /etc/nginx/
# sudo systemctl restart nginx
# sudo systemctl reload nginx
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a start

