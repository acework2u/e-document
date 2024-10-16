package config

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
