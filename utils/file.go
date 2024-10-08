package utils

import (
	"fmt"
	"path/filepath"
	"time"
)

// Generate a new filename to avoid conflicts, e.g., based on the current timestamp
func GenerateNewFileName(originalName string) string {
	ext := filepath.Ext(originalName) // Get file extension
	subFix := fmt.Sprintf("%d", time.Now().UnixNano())
	baseName := time.Now().Format("20060102") + "_" + subFix + ext
	return baseName
}
