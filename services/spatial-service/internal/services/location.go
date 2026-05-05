package services

import "spatial-service/internal/repo"

type LocationService struct {
	locationRepo *repo.LocationRepo
}

func NewLocationService(repo *repo.LocationRepo) *LocationService {
	return &LocationService{
		locationRepo: repo,
	}
}

func (ls *LocationService) UpdateLocation(userID string, long float64, lat float64) {

}
