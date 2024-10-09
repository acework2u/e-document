package utils

import (
	"fmt"
	"path/filepath"
	"time"
)

// Generate a new filename to avoid conflicts, e.g., based on the current timestamp
func GenerateNewFileName(originalName, docId string, suffix int) string {
	ext := filepath.Ext(originalName) // Get file extension
	//subFix := fmt.Sprintf("%d", time.Now().UnixNano())
	suffixText := fmt.Sprintf("%d", suffix)
	baseName := docId + "-" + time.Now().Format("20060102") + "-" + suffixText + ext
	return baseName
}
