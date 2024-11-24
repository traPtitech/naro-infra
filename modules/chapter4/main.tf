
resource "google_compute_network" "this" {
  name = "naro-ch4-vpc"
}

resource "google_compute_subnetwork" "tokyo" {
  name          = "naro-ch4-subnet-tokyo"
  region        = "asia-northeast1"
  ip_cidr_range = "10.0.0.0/16"
  network       = google_compute_network.this.id
}

resource "google_compute_subnetwork" "osaka" {
  name          = "naro-ch4-subnet-osaka"
  region        = "asia-northeast2"
  ip_cidr_range = "10.1.0.0/16"
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

module "tokyo" {
  count  = length(var.users.tokyo)
  source = "./participant"
  zone   = "asia-northeast1-a"

  user         = var.users.tokyo[count.index]
  admins       = var.admins
  image_id     = var.user_image_id
  machine_type = "e2-medium"
  subnet_id    = google_compute_subnetwork.tokyo.id
}

module "osaka" {
  count  = length(var.users.osaka)
  source = "./participant"
  zone   = "asia-northeast2-a"

  user         = var.users.osaka[count.index]
  admins       = var.admins
  image_id     = var.user_image_id
  machine_type = "e2-medium"
  subnet_id    = google_compute_subnetwork.osaka.id
}


resource "google_project_service" "dependencies" {
  for_each = toset([
    "compute.googleapis.com",
  ])
  service            = each.value
  disable_on_destroy = false
}
