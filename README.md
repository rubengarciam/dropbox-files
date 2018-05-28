# dropbox scripts

This is a collections of scripts for Dropbox.

**Installation**

Install [node.js](https://nodejs.org).

Clone/download the repo and install its dependencies

```
git clone https://github.com/rubengarciam/dropbox-scripts.git
cd dropbox-files
npm install
```

**Configuration**

You will need to configure _src/config.js_ with the tokens and other ids for your team:

- **TOKEN_USER -** token for performing file actions on behalf of the user. Must be a _full access_ token
- **TOKEN_ADMIN -** : token for performing file actions on behalf of the admin. Must be a _full access_ token
- **TOKEN_TMFA -** team member file access token
- **TOKEN_TMM -** team member management token
- **GROUP_PROJECT_CREATORS -** a group that the admin is part of. Must be the _group id_

You can find the group id withouth using the _API_ in the _Admin Console_:

1. Go to [https://www.dropbox.com/team/admin/groups](https://www.dropbox.com/team/admin/groups)
2. Open the desired group that contains the admin
3. The _url_ should have the following structure: _https://www.dropbox.com/team/admin/groups#/g:XXXXXXXX_
4. _"g:XXXXXXXX"_ is the _group id_

### listFiles

Lists the number of files for a Dropbox user.

**Requirements**

TOKEN_USER

**Parameters**

```
node src/listFiles.js DEPTH
```

where:

- _DEPTH_ is the folder tree depth you'd like use for aggregating the number of files. Use 0 if you just want to display the total number of files and folders

### newProject

Creates a team folder for a new project based on a specific folder template and creates the associated edit/read groups

**Requirements**

TOKEN_ADMIN, TOKEN_TMFA, TOKEN_TMM, GROUP_PROJECT_CREATORS

**Parameters**

```
node src/newProject.js project-name template-path
```

where:

- _project-name_ is the name of the project in question
- _template-path_ the path to the template folder. The admin must have access to this folder
