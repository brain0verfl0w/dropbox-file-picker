# dropbox-file-picker
Simple Dropbox chooser replacement (files and folders picker) with browser and Electron support.

![alt text](https://raw.githubusercontent.com/brain0verfl0w/dropbox-file-picker/graphics/images/list-view.png)

![alt text](https://raw.githubusercontent.com/brain0verfl0w/dropbox-file-picker/graphics/images/grid-view.png)

Features:
- Independent from default Dropbox chooser
- Without using external window or iframe
- Supports image files previews
- Ability to select multiple files & folders at the same time
- Supports grid and list layout modes

Installation:

`npm i dropbox-file-picker`


Usage:
```javascript
import dropboxPicker from 'dropbox-file-picker';

dropboxPicker.open({
    accessToken: credentials.accessToken, // user's accessToken (required)
    allowedExtensions: extensions, // like ['png', 'jpg', '.gif'] (with or without dot)
    allowFolderSelection: false, // folder selection (optional)
    isMultiple: true, // multiple entries (files/folders) selection
    loadPreviews: true, // load preview for supported image formats ('jpg', 'jpeg', 'png', 'tiff', 'tif', 'gif', 'bmp')
    hideCountLabel: false, // show or hide label 'You've selected * entries' (optional, default "false")
    previewSettings: {
        size: 'w256h256', // preview size, by (optional, default "w64h64")
    }
})
.then(result => success(result)); // promise with selected files info
```

Preview thumbnail size can be: `w32h32` `w64h64` `w128h128` `w256h256` `w480h320` `w640h480` `w960h640` `w1024h768` `w2048h1536`