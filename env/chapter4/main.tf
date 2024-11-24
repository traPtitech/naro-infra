data "google_project" "this" {}

locals {
  config        = yamldecode(file("config.yaml"))
  user_image_id = "naro-chapter4-participant-20241124-0423" # TODO: familyにしたい
}

module "docker" {
  source     = "../../modules/docker"
  project_id = data.google_project.this.number
}



module "chapter4" {
  source = "../../modules/chapter4"

  users = coalesce(local.config.participants, {
    tokyo = [],
    osaka = [],
  })
  admins         = local.config.admins
  user_image_id  = local.user_image_id
  admin_image_id = local.user_image_id # TODO: Admin用Imageの準備
}

