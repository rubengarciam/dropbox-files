const Dropbox = require('dropbox')
var Promise = require('promise')
var axios = require('axios')
const ora = require('ora')
var config = require('./config')

if ( process.argv.length != 4) {
  console.log("Wrong parameters: node src/newProject.js project-name template-path")
  return
}
// init Dropbox
//var dbx = new Dropbox({ accessToken: process.argv[2] })
const PROJECT = process.argv[2]
const TEMPLATE = process.argv[3]

var groups = []
var out = {}

// Creates a group with the desired name
function createGroup(name){
  return new Promise((resolve,reject) => {
     axios.post('https://api.dropboxapi.com/2/team/groups/create',{
         group_name: name
       },{
         headers: {
           'Authorization': config.TOKEN_TMM,
           'Content-Type': 'application/json'
         }
       }).then(res => {
         resolve({name: name, id: res.data.group_id})
       }).catch(error => {
         reject(error.response)
       })
   })
}

// Creates the 2 groups required for the project (edit, read only)
function create2Groups(){
  return new Promise((resolve,reject) => {
    createGroup(PROJECT+" EDIT").then(res => {
      groups.push(res)
      createGroup(PROJECT+" READ").then(res => {
        groups.push(res)
        resolve(groups)
      }).catch(error => {
        reject(error)
      })
    }).catch(error => {
      reject(error)
    })
  })
}

// Add groups to the folder
function shareFolderWithGroups(){
  return new Promise((resolve,reject) => {
    let members = []
    groups.map(group => {
      members.push({
        member: {
          ".tag": "dropbox_id",
          dropbox_id: group.id
        },
        access_level: ""
      })
      return true
    })
    // Setting permission levels
    members[0].access_level = "editor"
    members[1].access_level = "viewer"
    // Adding project creators group
    members.push({
      member: {
        ".tag": "dropbox_id",
        dropbox_id: config.GROUP_PROJECT_CREATORS
      },
      access_level: "editor"
    })
    // Sharing folder with members
    let sharedId = out.id
    axios.post('https://api.dropboxapi.com/2/sharing/add_folder_member',{
          shared_folder_id: sharedId,
          members: members,
          quiet: true
      },{
        headers: {
          'Authorization': config.TOKEN_ADMIN,
          'Content-Type': 'application/json'
        }
      }).then(res => {
        out.groups = groups
        resolve(res.response)
      }).catch(error => {
        reject(error.response)
      })
     })
}

// Duplicate the project template in the new team folder
function copyTemplate(){
  return new Promise((resolve,reject) => {
    // first, get all the contents of the template
    axios.post('https://api.dropboxapi.com/2/files/list_folder',{
        path: TEMPLATE,
        recursive: false
      },{
        headers: {
          'Authorization': config.TOKEN_ADMIN,
          'Content-Type': 'application/json'
        }
      }).then(res => {
        let files = res.data.entries
        if (!files) { reject({data: {error_summary: "There are no contents in this template folder"}}) }
        // create the folder contents copy batch action
        let entries = []
        files.forEach(file => {
          entries.push({
            "from_path": file.path_lower,
            "to_path": "/"+PROJECT+"/"+file.name
          })
        })
        axios.post('https://api.dropboxapi.com/2/files/copy_batch',{
            entries: entries,
            allow_shared_folder: true,
            autorename: false,
            allow_ownership_transfer: true
          },{
            headers: {
              'Authorization': config.TOKEN_ADMIN,
              'Content-Type': 'application/json'
            }
          }).then(res => {
            resolve(true)
          }).catch(error => {
            reject(error.response)
          })
      }).catch(error => {
        reject(error.response)
      })
   })
}

// Creates a new Team Folder for the project
function newTF() {
   return new Promise((resolve,reject) => {
     axios.post('https://api.dropboxapi.com/2/team/team_folder/create',{
         name: PROJECT,
         sync_setting: 'not_synced'
       },{
         headers: {
           'Authorization': config.TOKEN_TMFA,
           'Content-Type': 'application/json'
         }
       }).then(res => {
         out.id = res.data.team_folder_id
         out.name = res.data.name
         out.path = "/"+out.name
         resolve(true)
       }).catch(error => {
         reject(error.response)
       })
   })
 }

// START script
var spinnerText = "Creating project's team folder "
const spinner = ora(spinnerText).start();
setInterval(() => {
	spinner.text = spinnerText
}, 10);

newTF().then(() => {
  spinnerText = "Creating read/write groups"
  create2Groups().then(() => {
    spinnerText = "Adding groups to project"
    shareFolderWithGroups().then(() => {
      spinnerText = "Copying folder structure"
      copyTemplate().then(() => {
        spinner.succeed("Finished")
        console.log(out)
        process.exit()
      }).catch(error => {
        spinner.fail(error.data.error_summary)
        process.exit(1)
      })
    }).catch(error => {
      spinner.fail(error.data.error_summary)
      process.exit(1)
    })
  }).catch(error => {
    spinner.fail(error.data.error_summary)
    process.exit(1)
  })
}).catch(error => {
  spinner.fail(error.data.error_summary)
  process.exit(1)
})
