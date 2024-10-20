

output "instance_users" {
  value = { for instance in module.participants : instance => instance.instance_user }
}
