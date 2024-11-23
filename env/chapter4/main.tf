data "google_project" "this" {}
module "docker" {
  source     = "../../modules/docker"
  project_id = data.google_project.this.number
}



# module "chapter4" {
#   source = "../../modules/participants"

#   users      = var.users
#   admins     = var.admins
#   user_mi_id = var.user_mi_id
# }
