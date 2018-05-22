# dropbox-files

Lists the number of files for a Dropbox user.

### Using locally

**Installation**

Install [node.js](https://nodejs.org).

Clone/download the repo and install its dependencies

```
git clone https://github.com/rubengarciam/dropbox-files.git
cd dropbox-files
npm install
```

**Parameters**

```
node src/index.js TOKEN DEPTH
```

where:

- _TOKEN_ is an access token for the desired Dropbox user
- _DEPTH_ is the folder tree depth you'd like use for aggregating the number of files. Use 0 if you just want to display the total number of files and folders
