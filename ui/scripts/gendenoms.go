package main

import (
	"crypto/sha256"
	"fmt"
)

func main() {
	var input string
	fmt.Scanln(&input)
	sum := sha256.Sum256([]byte(input))
	fmt.Printf("%x", sum)
}
