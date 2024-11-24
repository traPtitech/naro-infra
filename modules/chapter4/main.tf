
resource "google_compute_network" "this" {
  name = "naro-ch4-vpc"
}

resource "google_compute_subnetwork" "this" {
  name          = "naro-ch4-subnet"
  ip_cidr_range = "10.0.0.0/16"
  network       = google_compute_network.this.id
}

resource "google_compute_firewall" "ssh" {
  name    = "allow-ssh"
  network = google_compute_network.this.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  allow {
    protocol = "icmp"
  }

  source_ranges = ["0.0.0.0/0"]
}

module "participants" {
  count  = length(var.users)
  source = "./participant"

  user         = var.users[count.index]
  admins       = var.admins
  image_id     = var.user_image_id
  machine_type = "e2-medium"
  subnet_id    = google_compute_subnetwork.this.id
}


resource "google_project_service" "dependencies" {
  for_each = toset([
    "compute.googleapis.com",
  ])
  service            = each.value
  disable_on_destroy = false
}
