include .env
dev:
	docker-compose up
stop:
	docker-compose down
build:
	docker buildx build --platform=linux/amd64 -t  e-document-ci-cd-net . --target production -f Dockerfile.production --no-cache
#	# docker buildx build --platform=linux/amd64 -t go-ci-cd-prod . --target production -f Dockerfile.production --no-cache
