//dataToCheck = [2, 8, 0, 48, 48, 43, 48, 48, 43, 49, 55, 14, 3]

const dataToCheck = [8, 0, 48, 48, 43, 48, 48, 43, 49, 55]
const checkSum = dataToCheck.reduce((a, p) => a ^ p)
console.log(checkSum)
