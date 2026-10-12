data "external_schema" "gorm" {
  program = [
    "go", "run", "ariga.io/atlas-provider-gorm", "load",
    "--path", "./internal/models",
    "--dialect", "postgres",
  ]
}

env "gorm" {
  src = data.external_schema.gorm.url
  dev = "docker://postgres/18/dev"
  exclude = ["bases"]
  migration {
    dir = "file://internal/migrations?format=golang-migrate"
  }
}
