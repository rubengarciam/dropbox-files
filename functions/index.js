const functions = require('firebase-functions');
const Dropbox = require('dropbox')
var Promise = require('promise')

var dbx = null

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
 });

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
    // validate if need to call recursively
    if(items.has_more) {
        // retrieve new files from cursor and call
        dbx.filesListFolderContinue({cursor: items.cursor})
         .then((res) => {
           listFiles(res)
            .then((others) => { resolve(files.concat(others))})
            .catch((err) => { reject (err)})
         }).catch((err) => { reject(err) })
      } else { resolve(files) }
    })
}

// function to compare and help reordering alphabetically
function compare(a, b) {
  // Assuming you want case-insensitive comparison
  a = a.toLowerCase();
  b = b.toLowerCase();
  return (a < b) ? -1 : (a > b) ? 1 : 0;
}

exports.files = functions.https.onRequest((request, response) => {
  // 'token' parameter required
  if(!request.query.token) {
    response.send("token parameter required")
  }
  // init Dropbox
  dbx = new Dropbox({ accessToken: request.query.token })
  // get all files for the user, recursively
  dbx.filesListFolder({path: '', recursive: true})
    .then((res) => {
      listFiles(res).then((items) => {
        response.send({
          total: items.length,
          files: items.sort(compare)
        })
      }).catch((err) => { response.send(err) })
    }).catch((err) => { response.send(err) })
 });
