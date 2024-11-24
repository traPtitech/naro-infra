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



variable "user_image_id" {
  type = string
}

variable "admin_image_id" {
  type = string
}
