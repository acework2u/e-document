FROM golang:alpine3.20 AS development

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

RUN go install github.com/air-verse/air@latest
RUN air init

#COPY ./cmd .

COPY . .

EXPOSE 8088

CMD air