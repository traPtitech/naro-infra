
output "instance_user" {
  value = format("%s:%s", var.user.id, google_compute_instance_from_machine_image.this.network_interface.0.access_config.0.nat_ip)
}
