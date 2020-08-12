let strdec = "00000000000023329147"
let strtes = '99999999999999999999'
let strarr = `${strdec * 1}`.split("").map(c => c.charCodeAt(0))

// Conversao Vertti
const parte1 = strdec.substr(-8, 3) * 1
const parte2 = strdec.substr(-5) * 1
console.log(`Convertido vertti ${parte1.toString(16)}${parte2.toString(16)}`)

strdec = strdec * 1
console.log(strarr)
console.log(strarr.reduce((a, p) => a + p).toString(16))
//console.log(strdec * 1)
console.log('maxlen', (strtes * 1).toString(2).length)
let curr_tag = 0xe971db
console.log(strdec.toString(2))
console.log(curr_tag.toString(2))
strdec = strdec >> 1
console.log(strdec.toString(2))
bytedir = strdec % Math.pow(2, 15)
strdec = Math.floor(strdec / Math.pow(2, 15))
console.log(bytedir.toString(2))
console.log(bytedir.toString(16))
console.log(strdec.toString(2))
console.log(strdec.toString(16))
console.log((strdec | curr_tag).toString(2))
let invdec = strdec & curr_tag
console.log(invdec.toString(16))
let invdec1 = strdec | curr_tag
console.log(invdec1.toString(16))
strdec = "00000000000024927133" * 1
//console.log(strdec * 1)
curr_tag = 0xe971db
console.log(strdec.toString(16))
invdec = strdec & curr_tag
console.log(invdec.toString(16))
invdec1 = strdec | curr_tag
console.log(invdec1.toString(16))
//01011000 11111110010111101 1
/*
for (let i = 1; i < 9999; i++) {
    const invdec = strdec & i
    console.log(invdec.toString(16))
}
*/