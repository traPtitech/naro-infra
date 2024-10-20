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

variable "machine_image_id" {
  type = string

}

variable "machine_size" {
  type = string
}
