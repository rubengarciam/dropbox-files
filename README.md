# dropbox-files

Lists the number of files for a Dropbox user.

**Using locally**

```
node src/index.js TOKEN
```

where _TOKEN_ is an access token for the desired Dropbox user

**Using as a service**

Call:

```
https://us-central1-dropbox-files-591ad.cloudfunctions.net/files?token=TOKEN
```

where _TOKEN_ is an access token for the desired Dropbox user

Not suitable for users with a lot of files, firebase timeouts
