packer {
  required_plugins {
    googlecompute = {
      version = ">= 1.1.6"
      source  = "github.com/hashicorp/googlecompute"
    }
  }
}


source "googlecompute" "base" {
  project_id  = "naro-chapter4"
  source_image = "ubuntu-2404-noble-amd64-v20241115"
  source_image_family = "ubuntu-2404-lts-amd64" 
  zone        = "asia-northeast1-a"
  image_name  = "naro-chapter4-participant"
  ssh_username = "packer"
}

build {
  sources = ["source.googlecompute.base"]

  provisioner "ansible" {
    playbook_file = "ansible/participant.yml"
    host_alias = "participant"
  }

}
