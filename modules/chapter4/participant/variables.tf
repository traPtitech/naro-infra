variable "user" {
  type = object({
    id         = string
    public_key = string
  })
}

variable "admins" {
  type = list(object({
    id         = string
    public_key = string
  }))
}

variable "image_id" {
  type = string

}

variable "machine_type" {
  type = string
}

variable "subnet_id" {
  type = string
}
