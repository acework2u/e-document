package config

import (
	"context"
	"github.com/spf13/viper"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"log"
	"time"
)

type DbMongo struct {
	DbName string
	Port   string
	Uri    string
}
type App struct {
	Port         string
	ClientOrigin string
	GinMode      string
}

type Config struct {
	DB  DbMongo
	App App
}

func NewConfig() (*Config, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("./config")
	viper.AddConfigPath("./cmd/config/")
	viper.AddConfigPath("../../cmd/config/")
	viper.AutomaticEnv()

	err := viper.ReadInConfig()
	if err != nil {
		log.Printf("Error reading config file, %s", err)
	}
	config := &Config{}
	err = viper.Unmarshal(config)
	return config, err

}
func ConnectionDB() (*mongo.Client, error) {
	cfg, err := NewConfig()
	if err != nil {
		return nil, err
	}

	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(cfg.DB.Uri))
	if err != nil {
		return nil, err
	}
	if client == nil {
		return nil, err
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		return nil, err
	}
	return client, nil

}
func GetCollection(client *mongo.Client, collectionName string) *mongo.Collection {
	cfg, err := NewConfig()
	if err != nil {
		log.Println(err)
	}

	collection := client.Database(cfg.DB.DbName).Collection(collectionName)
	return collection

}
