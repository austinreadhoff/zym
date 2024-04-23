package main

import (
	"encoding/json"
	"log"
	"os"
)

func LoadJSON[T any](path string) T {
	var output T
	content, err := os.ReadFile(path)
	if err != nil {
		log.Println("failure reading file: ", path, ".  Error: ", err)
	}
	err = json.Unmarshal(content, &output)
	if err != nil {
		log.Println("failure parsing json as object: ", path, ".  Error: ", err)
	}

	return output
}
