package utils

import "fmt"

const SERVICE_NAME = "spatial-service"

func RedisKey(domain, identifier string) string {
	return fmt.Sprintf("%s:%s:%s", SERVICE_NAME, domain, identifier)
}
