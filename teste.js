let strdec = "00000000000023329147" * 1
//console.log(strdec * 1)
let curr_tag = 0xe971db
console.log(strdec.toString(16))
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

/*
for (let i = 1; i < 9999; i++) {
    const invdec = strdec & i
    console.log(invdec.toString(16))
}
*/