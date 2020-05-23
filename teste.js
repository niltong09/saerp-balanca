const strdec = "00000000000023329147" * 1
//console.log(strdec * 1)
const curr_tag = 0xe971db
console.log(strdec.toString(16))
const invdec = strdec | 1
console.log(invdec.toString(16))
/*
for (let i = 1; i < 9999; i++) {
    const invdec = strdec & i
    console.log(invdec.toString(16))
}
*/