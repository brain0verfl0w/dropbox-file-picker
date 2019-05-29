# dropbox-file-picker
Simple file/folder picker for Dropbox API with browser and Electron support

Installation:

`npm i dropbox-file-picker`


Usage:
```javascript
import dropboxPicker from 'dropbox-file-picker';

dropboxPicker.open({
    allowedExtensions: extensions, // like ['png', 'jpg', '.gif'] (with or without dot)
    allowFolderSelection: false, // folder selection
    isMultiple: true, // multiple entries (files/folders) selection
    loadPreviews: true, // load preview for supported image formats ('jpg', 'jpeg', 'png', 'tiff', 'tif', 'gif', 'bmp')
    accessToken: credentials.accessToken, // user's accessToken
})
.then(result => success(result)); // promise with selected files info
```
