resource "google_compute_instance" "this" {
  name = format("naro-ch4-%s", var.user.id)

  boot_disk {
    auto_delete = false
    source      = google_compute_disk.this.self_link
  }

  machine_type = var.machine_type

  metadata = {
    ssh-keys = join("\n", concat(tolist([format("%s:%s", var.user.id, var.user.public_key)]), tolist([for admin in var.admins : format("%s:%s", admin.id, admin.public_key)])))
  }

  metadata_startup_script = "sudo sudo usermod -aG docker ${var.user.id}"

  network_interface {
    subnetwork = var.subnet_id
    access_config {}
  }
}

resource "google_compute_disk" "this" {
  name  = format("naro-ch4-%s-disk", var.user.id)
  image = var.image_id
  size  = 30

  type = "pd-standard"
}
