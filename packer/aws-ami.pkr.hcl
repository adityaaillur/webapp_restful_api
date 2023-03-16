variable "ami_users" {
  type    = list(string)
  default = ["393640817367", "032083062214"]
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "source_ami" {
  type    = string
  default = "ami-0dfcb1ef8550277af"
}

variable "instance_type" {
  type    = string
  default = "t2.micro"
}

variable "ssh_username" {
  type    = string
  default = "ec2-user"
}

variable "subnet_id" {
  type    = string
  default = "subnet-0442b48d81b299aa0"
}

variable "vpc_id" {
  type    = string
  default = "vpc-0f9df930d99d2b542"
}

variable "ami_name" {
  type    = string
  default = "webapp-ami"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "aws_profile" {
  type    = string
  default = "dev"
}

source "amazon-ebs" "webapp-ami" {
  ami_name      = "${var.ami_name}"
  ami_users     = "${var.ami_users}"
  profile       = "${var.aws_profile}"
  instance_type = "${var.instance_type}"
  region        = "${var.region}"
  source_ami    = "${var.source_ami}"
  ssh_username  = "${var.ssh_username}"
  subnet_id     = "${var.subnet_id}"
  tags = {
    Name        = "${var.ami_name}"
    Environment = "${var.environment}"
  }
  vpc_id = "${var.vpc_id}"

  launch_block_device_mappings {
    device_name           = "/dev/xvda"
    volume_size           = 8
    delete_on_termination = true
  }
}

build {
  sources = [
    "source.amazon-ebs.webapp-ami"
  ]

  provisioner "file" {
    source      = "../webapp"
    destination = "/home/ec2-user/webapp"
  }

  provisioner "shell" {
    script = "provision.sh"
  }
}