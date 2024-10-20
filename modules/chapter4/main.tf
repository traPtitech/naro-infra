
resource "google_compute_network" "this" {
  name = "naro-ch4-vpc"
}

resource "google_compute_subnetwork" "this" {
  name          = "naro-ch4-subnet"
  ip_cidr_range = "192.168.0.0/16"
  network       = google_compute_network.this.id
}

module "paricipants" {
  count  = length(var.users)
  source = "./participants"

  user             = var.users[count.index]
  admins           = var.admins
  machine_image_id = var.user_mi_id
  machine_size     = "e2-micro"
  subnet_id        = google_compute_subnetwork.this.id
}
