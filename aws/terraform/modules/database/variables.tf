variable "identifier" {
  type = string
}

variable "engine" {
  type    = string
  default = "postgres"
}

variable "engine_version" {
  type = string
}

variable "instance_class" {
  type = string
}

variable "allocated_storage" {
  type = number
}

variable "db_name" {
  type = string
}

variable "username" {
  type      = string
  sensitive = true
}

variable "password" {
  type      = string
  sensitive = true
}

variable "db_subnet_group_name" {
  type = string
}

variable "vpc_security_group_ids" {
  type = list(string)
}

variable "skip_final_snapshot" {
  type    = bool
  default = true
}

variable "tags" {
  type    = map(string)
  default = {}
}
