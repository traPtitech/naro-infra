resource "google_artifact_registry_repository" "images" {
  format = "DOCKER"

  location      = "asia-northeast1"
  repository_id = "images"

  depends_on = [google_project_service.dependencies]
}

resource "google_project_service" "dependencies" {
  for_each = toset([
    "artifactregistry.googleapis.com",
  ])
  service            = each.value
  disable_on_destroy = false
}

resource "google_artifact_registry_repository_iam_member" "images" {
  repository = google_artifact_registry_repository.images.name
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${var.project_id}-compute@developer.gserviceaccount.com"
}
