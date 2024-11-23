terraform {
  backend "gcs" {
    bucket = "naro-tfstate-20241123"
    prefix = "naro/chapter4"
  }
}

provider "google" {
  project = "naro-chapter4"
  region  = "asia-northeast1"
}
