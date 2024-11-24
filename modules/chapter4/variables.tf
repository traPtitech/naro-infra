variable "users" {
  type = object({
    tokyo = list(object({
      id         = string
      public_key = string
    }))
    osaka = list(object({
      id         = string
      public_key = string
    }))
    seoul = list(object({
      id         = string
      public_key = string
    }))
  })
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
