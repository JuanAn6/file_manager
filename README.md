# File manager

This project is designed to be a file manager on a local server.

This way, you can have a website at home to upload and download files from the small server, which can be set up using an old computer or a Raspberry Pi.

The app will be developed in React, Laravel and will need to storage the data Mysql.

---

## API


### Endpoints

I will update all the examples of the api functions while i'm implementing them.

Get user home directori with all the folders and files.
```
POST: /api/v1/get_home_files
{
    directory: '/'
}
```