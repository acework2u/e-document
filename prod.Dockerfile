FROM golang:alpine3.20 AS builder

ENV GOOS=linux
ENV CGO_ENABLE=0
ENV GOARCH=amd64

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download
#RUN go mod tidy

COPY . .

#RUN go build -o app /cmd/main.go
RUN go build -o api-server .
# RUN go build -o api-server ./cmd/main.go

FROM alpine:3.14 AS production
RUN apk add --no-cach ca-certificates

ENV GIN_MODE=release
ENV APP_HOME /app
RUN mkdir -p "$APP_HOME"

WORKDIR "$APP_HOME"
RUN pwd

COPY --from=builder /app/api-server app-server
RUN ["chmod","+x","app-server"]
EXPOSE 8088
CMD ["./app-server"]
#CMD ./app-server