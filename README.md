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
- _DEPTH_ is the folder tree depth you'd like to display

### Using as a service

Call:

```
https://us-central1-dropbox-files-591ad.cloudfunctions.net/files?token=TOKEN
```

where _TOKEN_ is an access token for the desired Dropbox user

Not suitable for users with a lot of files, firebase timeouts
