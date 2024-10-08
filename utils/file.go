package utils

import (
	"strings"
)

func GenerateNewFileName(originalName string) (string, error) {
	//ext := filepath.Ext(originalName) // Get file extension
	//lowExt := strings.ToLower(ext)
	//volumeName := filepath.Base(originalName)
	//fmt.Println(volumeName)
	//fmt.Println("in file help")
	//fmt.Println(ext)
	//
	//baseName := time.Now().Format("20060102150405") // Current timestamp as base name
	//return baseName + lowExt
	//
	newFileName := strings.Replace(originalName, " ", "_", -1)
	return newFileName, nil
}
