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
- Localization support
- Adjustable grid layout columns count

Installation:

`npm i dropbox-file-picker`


#### Usage:
##### Minimal setup:
```javascript
import dropboxPicker from 'dropbox-file-picker';

dropboxPicker.open({ accessToken: 'dropbox_access_token_here' })
    .then(result => success(result));
```

##### Advanced setup:
```javascript
import dropboxPicker from 'dropbox-file-picker';

dropboxPicker.open({
    accessToken: 'dropbox_access_token_here', // user's accessToken (required)
    allowedExtensions: extensions, // like ['png', 'jpg', '.gif'] (with or without dot) (optional)
    allowFolderSelection: false, // folder selection (optional)
    isMultiple: true, // multiple entries (files/folders) selection
    loadPreviews: true, // load preview for supported image formats ('jpg', 'jpeg', 'png', 'tiff', 'tif', 'gif', 'bmp')
    hideCountLabel: false, // show or hide label 'You've selected * entries' (optional, defaults to 'false')
    hideCheckboxes: false, // hide checkboxes (optional, defaults to 'false')
    rows: 4, // rows count in grid mode (optional, defaults to 4, min 1, max 10)
    defaultLayout: 'list', // layout mode (optional, defaults to 'list', supported values: 'list', 'grid')
    disableLayoutSelection: true, // ability to select layout mode (optional, defaults to 'false')
    width: '700px', // custom width (optional, defaults to '50%', supported values: any css width value)
    previewSettings: {
        size: 'w256h256', // preview size (optional, default "w64h64")
    },
    localization: { // translation (optional)
        title: 'Dropbox', // main title
        cancel: 'Cancel', // cancel button
        choose: 'Choose', // choose button
        entriesSelectionLabel: 'You\'ve selected {0} entries' // entries selection label
    }
})
.then(result => success(result)); // promise with selected files info
```

Supported previews size: `w32h32` `w64h64` `w128h128` `w256h256` `w480h320` `w640h480` `w960h640` `w1024h768` `w2048h1536`