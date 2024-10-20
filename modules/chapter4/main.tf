


module "paricipants" {
  count  = length(var.users)
  source = "./participants"

  user             = var.users[count.index]
  admins           = var.admins
  machine_image_id = var.user_mi_id
  machine_size     = "e2-micro"
}
