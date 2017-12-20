const Dropbox = require('dropbox')
const ora = require('ora');
var Promise = require('promise')

if ( process.argv.length < 3) {
  console.log("Missing token: node src/index.js  TOKEN depth")
  return
}
// init Dropbox
var dbx = new Dropbox({ accessToken: process.argv[2] })
var numFiles = 0
var numFolders = 0
var files = []
var folders = []
const SPACER = "   "

// async, returns number of files
function listFiles(items){
  return new Promise(function(resolve,reject){
    items.entries.map((item) => {
      // only push files to array
      if(item['.tag'] == 'file') {
        files.push(item.path_lower)
      } else if (!folders.includes(item.path_lower)) {
        folders.push(item.path_lower)
      }
    })
    // validate if need to call recursively
    if(items.has_more) {
        // retrieve new files from cursor and call
        dbx.filesListFolderContinue({cursor: items.cursor})
         .then((res) => {
           listFiles(res)
            .then((others) => {
              resolve()
            }).catch((err) => {
              reject(err)
            })
         }).catch((err) => {
           reject(err)
        })
      } else { resolve() }
    })
}

// function to compare and help reordering alphabetically
function compare(a, b) {
  // Assuming you want case-insensitive comparison
  a = a.toLowerCase();
  b = b.toLowerCase();
  return (a < b) ? -1 : (a > b) ? 1 : 0;
}

// function to aggregate the amount of files per specific folder path
function listFilesFolder(){
  let depth = process.argv[3]
  folders.sort(compare).map((folder) => {
    let folderDepth = folder.split("/").length - 1
    if(!depth || (folderDepth <= depth)){
      let i = 0
      files.map((file) => {
        if (file.startsWith(folder)) { i++ }
      })
      let indent = ""
      for (z = 1; z < folderDepth; z++) {
        indent+=SPACER
      }
      console.log(indent+folder+" > "+ i+" files")
    }
  })
  process.exit()
}

// START script
const spinner = ora('Found '+files.length+" files in "+folders.length+" folders").start();
setInterval(() => {
	spinner.text = 'Found '+files.length+" files in "+folders.length+" folders";
}, 80);

// get all files for the user, recursively
dbx.filesListFolder({path: '', recursive: true})
  .then((res) => {
    listFiles(res).then((items) => {
      spinner.succeed('Found '+files.length+" files in "+folders.length+" folders")
      listFilesFolder()
    }).catch((err) => {
      spinner.fail(err)
      process.exit()
    })
  }).catch((err) => {
    spinner.fail(err)
    process.exit()
  })
