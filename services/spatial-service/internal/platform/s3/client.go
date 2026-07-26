package s3

import (
	"context"
	"fmt"
	"spatial-service/internal/config"
	"spatial-service/internal/platform/logger"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"go.uber.org/fx"
)

func New(cfg *config.Config) (*s3.Client, error) {
	loadOpts := []func(*awsconfig.LoadOptions) error{
		awsconfig.WithRegion(cfg.S3.Region),
	}

	if cfg.S3.AccessKeyID != "" {
		loadOpts = append(loadOpts, awsconfig.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(
				cfg.S3.AccessKeyID,
				cfg.S3.SecretAccessKey,
				"",
			),
		))
	}

	awsCfg, err := awsconfig.LoadDefaultConfig(context.Background(), loadOpts...)
	if err != nil {
		return nil, fmt.Errorf("load aws config: %w", err)
	}

	client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		if cfg.S3.Endpoint != "" {
			o.BaseEndpoint = &cfg.S3.Endpoint
		}
		o.UsePathStyle = cfg.S3.UsePathStyle
	})

	return client, nil
}

func RegisterLifecycle(lc fx.Lifecycle, client *s3.Client, cfg *config.Config, l *logger.Logger) {
	lc.Append(
		fx.Hook{
			OnStart: func(ctx context.Context) error {
				checkCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
				defer cancel()

				if _, err := client.HeadBucket(checkCtx, &s3.HeadBucketInput{
					Bucket: aws.String(cfg.S3.Bucket),
				}); err != nil {
					return fmt.Errorf("s3 bucket %q unreachable: %w", cfg.S3.Bucket, err)
				}

				l.Infof("connected to s3 bucket %q", cfg.S3.Bucket)
				return nil
			},
		},
	)
}
