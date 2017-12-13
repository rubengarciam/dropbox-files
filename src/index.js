const Dropbox = require('dropbox')
var Promise = require('promise')

if ( process.argv.length < 3) {
  console.log("Missing token: node src/index.js  TOKEN")
  return
}
// init Dropbox
var dbx = new Dropbox({ accessToken: process.argv[2] })
var numFiles = 0

// async, returns number of files
function listFiles(items){
  let files = []
  return new Promise(function(resolve,reject){
    items.entries.map((item) => {
      // only push files to array
      if(item['.tag'] == 'file') {
        files.push(item.path_lower)
      }
    })
    numFiles += files.length
    console.log(numFiles)
    // validate if need to call recursively
    if(items.has_more) {
        // retrieve new files from cursor and call
        dbx.filesListFolderContinue({cursor: items.cursor})
         .then((res) => {
           listFiles(res)
            .then((others) => { resolve(files.concat(others))})
            .catch((err) => {
              console.log(err)
              return
            })
         }).catch((err) => {
           console.log(err)
           return
        })
      } else {
        return numFiles
      }
    })
}

// function to compare and help reordering alphabetically
function compare(a, b) {
  // Assuming you want case-insensitive comparison
  a = a.toLowerCase();
  b = b.toLowerCase();
  return (a < b) ? -1 : (a > b) ? 1 : 0;
}

// get all files for the user, recursively
dbx.filesListFolder({path: '', recursive: true})
  .then((res) => {
    listFiles(res).then((items) => {
      console.log({
        total: items.length,
        files: items.sort(compare)
      })
    }).catch((err) => {
      console.log(err)
      return
    })
  }).catch((err) => {
    console.log(err)
    return
  })
