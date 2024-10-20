resource "google_compute_instance_from_machine_image" "this" {
  provider = google-beta
  name     = format("naro-ch4-%s", var.user.id)

  source_machine_image = var.machine_image_id

  machine_type = var.machine_size

  metadata = {
    ssh-keys = join("\n", [format("%s:%s", var.user.id, var.user.public_key)] + [for admin in var.admins : format("%s:%s", admin.id, admin.public_key)])
  }

  network_interface {
    subnetwork = var.subnet_id
  }
}
