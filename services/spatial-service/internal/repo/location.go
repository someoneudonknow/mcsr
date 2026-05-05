package repo

import (
	"context"
	redisv9 "github.com/redis/go-redis/v9"
	"spatial-service/internal/utils"
	"spatial-service/pkg/redis"
)

type LocationRepo struct {
	redisClient *redis.RedisClient
}

func NewLocationRepo(redisClient *redis.RedisClient) *LocationRepo {
	return &LocationRepo{
		redisClient,
	}
}

func (r *LocationRepo) getLocationKey(identifier string) string {
	return utils.RedisKey("location", identifier)
}

func (r *LocationRepo) UpdateUserLocation(
	ctx context.Context,
	userID string,
	long, lat float64,
) error {
	key := r.getLocationKey(userID)

	return r.redisClient.Client.GeoAdd(ctx, key, &redisv9.GeoLocation{
		Name:      userID,
		Longitude: long,
		Latitude:  lat,
	}).Err()
}
