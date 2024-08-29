package config

import (
	"github.com/spf13/viper"
	"log"
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
		log.Fatalf("Error reading config file, %s", err)
	}
	config := &Config{}
	err = viper.Unmarshal(config)
	return config, err

}
