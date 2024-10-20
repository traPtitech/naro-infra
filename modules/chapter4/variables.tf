variable "users" {
  type = list(object({
    id         = string
    public_key = string
  }))
}

variable "admins" {
  type = list(object({
    id         = string
    public_key = string
  }))
}



variable "user_mi_id" {
  type = string
}

variable "admin_mi_id" {
  type = string
}
