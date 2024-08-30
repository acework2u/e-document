package conf

import (
	"context"
	"fmt"
	"github.com/spf13/viper"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"log"
	"time"
)

type App struct {
	Port         string `json:"port" yaml:"port"`
	ClientOrigin string `json:"clientOrigin" yaml:"clientOrigin"`
	GinMode      string `json:"ginmode" yaml:"ginmode"`
}
type Db struct {
	DbName string `json:"dbname"`
	Port   string `json:"port"`
	Uri    string `json:"uri"`
}

type AppConf struct {
	DB  Db
	App App
}

func NewAppConf() (*AppConf, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("./config")
	viper.AddConfigPath("./cmd/config/")
	viper.AddConfigPath("../../cmd/config/")
	viper.AutomaticEnv()

	err := viper.ReadInConfig()
	if err != nil {
		log.Fatalf("Fatal error config file: %s \n", err)
	}
	config := &AppConf{}
	err = viper.Unmarshal(config)
	return config, err
}

func ConnectionDB() *mongo.Client {
	cfg, err := NewAppConf()
	if err != nil {
		log.Fatal(err)
	}

	//client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(cfg.DB.Uri))

	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(cfg.DB.Uri))
	if err != nil {
		log.Fatal(err)
	}

	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Connected to MongoDB!")
	return client

}

func GetCollection(client *mongo.Client, collectionName string) *mongo.Collection {
	cfg, err := NewAppConf()
	if err != nil {
		log.Fatal(err)
	}
	collection := client.Database(cfg.DB.DbName).Collection(collectionName)

	return collection

}
