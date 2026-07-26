package s3

import (
	"context"
	"fmt"
	"io"
	"spatial-service/internal/config"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/s3/transfermanager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type Storage interface {
	Upload(ctx context.Context, key string, body io.Reader, contentType string) error
	Download(ctx context.Context, key string) (io.ReadCloser, error)
	Delete(ctx context.Context, key string) error
	PresignGetURL(ctx context.Context, key string, expiry time.Duration) (string, error)
	PresignPutURL(ctx context.Context, key string, expiry time.Duration) (string, error)
}

type storage struct {
	client   *s3.Client
	uploader *transfermanager.Client
	presign  *s3.PresignClient
	bucket   string
}

func NewStorage(client *s3.Client, cfg *config.Config) Storage {
	return &storage{
		client:   client,
		uploader: transfermanager.New(client),
		presign:  s3.NewPresignClient(client),
		bucket:   cfg.S3.Bucket,
	}
}

func (s *storage) Upload(
	ctx context.Context,
	key string,
	body io.Reader,
	contentType string,
) error {
	_, err := s.uploader.UploadObject(ctx, &transfermanager.UploadObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		Body:        body,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return fmt.Errorf("s3 upload: %s: %w", key, err)
	}
	return nil
}

func (s *storage) Download(ctx context.Context, key string) (io.ReadCloser, error) {
	out, err := s.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, fmt.Errorf("s3 download %s: %w", key, err)
	}
	return out.Body, nil
}

func (s *storage) Delete(ctx context.Context, key string) error {
	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("s3 delete %s: %w", key, err)
	}
	return nil
}

func (s *storage) PresignGetURL(
	ctx context.Context,
	key string,
	expiry time.Duration,
) (string, error) {
	req, err := s.presign.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return "", fmt.Errorf("s3 presign get %s: %w", key, err)
	}
	return req.URL, nil
}

func (s *storage) PresignPutURL(
	ctx context.Context,
	key string,
	expiry time.Duration,
) (string, error) {
	req, err := s.presign.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(expiry))
	if err != nil {
		return "", fmt.Errorf("s3 presign put %s: %w", key, err)
	}
	return req.URL, nil
}
