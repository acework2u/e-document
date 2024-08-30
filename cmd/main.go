package main

import "fmt"

func diagonalDifference(arr [][]int32) int32 {
	// Write your code here
	var sum = int32(0)
	var left = int32(0)
	var right = int32(0)

	for i := 0; i < len(arr); i++ {

		left += arr[i][i]
		right += arr[i][len(arr[i])-1-i]

	}

	//if left > right {
	//	left, right = right, left
	//}

	sum = left - right
	if sum < 0 {
		sum = -sum
	}
	return sum

}

func main() {

	arr := [][]int32{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}
	result := diagonalDifference(arr)
	fmt.Println(result)

}
