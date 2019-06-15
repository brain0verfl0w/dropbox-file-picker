const { render, Component, h } = require('preact');
const { Dropbox } = require('dropbox');
const { splitArrayToChunks } = require('./utils');

require('./styles.css');

const DROPBOX_SUPPORTED_THUMBNAIL_IMAGES = ['jpg', 'jpeg', 'png', 'tiff', 'tif', 'gif', 'bmp'];
const DROPBOX_PREVIEW_QUALITY = 'w64h64';
const DROPBOX_PREVIEW_IMAGE_FORMAT = 'png';

class DropboxFilePicker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list: {
                entries: [],
            },
            breadcrumbs: [],
            isLoading: false,
            selectedEntries: [],
            allowedExtensions: null,
            layoutMode: 'list',
        };
        this.dropbox = new Dropbox({ accessToken: this.props.accessToken, fetch });

        if (this.props.allowedExtensions) {
            this.state.allowedExtensions = this.props.allowedExtensions.map((extension) => {
                return extension[0] === '.' ? extension.substring(1) : extension;
            });
        }
    }

    getFolderContent(path = '') {
        return new Promise((resolve, reject) => {
            this.dropbox.filesListFolder({ path })
                .then(list => resolve(list))
                .catch((error) => {
                    reject(error);
                    console.error(error);
                });
        });
    }

    updateBreadcrumbs(path) {
        const root = { path: '', name: 'Dropbox' };
        if (!path) {
            this.setState({ breadcrumbs: [root] });
            return;
        }
        const breadcrumbs = [];
        let pathAccumulator = '';
        const pathArray = path.split('/');
        pathArray.shift();
        pathArray.forEach((name) => {
            pathAccumulator += `/${name}`;
            breadcrumbs.push({
                path: pathAccumulator,
                name,
            });
        });
        this.setState({ breadcrumbs: [root, ...breadcrumbs] });
    }

    getUpperFolder(path) {
        if (!path) {
            return null;
        }
        const pathArray = path.split('/');
        pathArray.pop();
        return pathArray.join('/');
    }

    addUpperLevelEntry(list, path) {
        this.getUpperFolder(path);
        list.entries.unshift({
            name: '..',
            '.tag': null,
            path_lower: this.getUpperFolder(path),
        });
    }


    getExtension(name) {
        return name.split('.').pop();
    }

    loadPreviews(list) {
        const files = list.entries.filter(entry =>
            entry['.tag'] === 'file' && DROPBOX_SUPPORTED_THUMBNAIL_IMAGES.includes(this.getExtension(entry.name)));
        const fileChunks = splitArrayToChunks(files);

        const size = this.props.previewSettings &&
        this.props.previewSettings.size ? this.props.previewSettings.size : DROPBOX_PREVIEW_QUALITY;

        fileChunks.forEach((files) => {
            this.dropbox.filesGetThumbnailBatch({
                entries: files.map(entry => ({
                    path: entry.id,
                    format: { '.tag': DROPBOX_PREVIEW_IMAGE_FORMAT },
                    size: { '.tag': size },
                    mode: { '.tag': 'strict' },
                })),
            }).then(result => this.applyThumbnails(result));
        });
    }

    applyThumbnails(result) {
        const stateEntries = this.state.list.entries;
        result.entries.forEach((entry) => {
            if (!entry.metadata || !entry.thumbnail) {
                return;
            }
            const stateEntry = stateEntries.find(e => e.id === entry.metadata.id);
            if (stateEntry) {
                stateEntry.thumbnailUrl = `data:image/${DROPBOX_PREVIEW_IMAGE_FORMAT};base64,${entry.thumbnail}`;
            }
        });
        this.setState({ list: { entries: stateEntries }});
    }

    drawFolderContents(path) {
        this.setState({ isLoading: true });
        this.getFolderContent(path).then((list) => {
            this.updateBreadcrumbs(path);
            this.setState({ list });
            if (path) {
                this.addUpperLevelEntry(list, path);
            }
            if (this.props.loadPreviews) {
                this.loadPreviews(list);
            }
        }).finally(() => {
            this.setState({ isLoading: false });
        });
    }

    componentDidMount() {
        this.drawFolderContents();
    }

    renderItem(entry) {
        return (
            <div
                className={`dropbox-folder-entry ${this.isSelected(entry) ? 'dropbox-selected-entry' : ''}`}
                key={entry.id}
            >
                {this.renderItemCheckbox(entry)}
                {this.renderItemFullName(entry)}
            </div>
        );
    }

    renderItemFullName(entry) {
        let entryIcon = '';
        let selectableClass = '';
        let onClick = () => {};
        if (entry['.tag'] === 'folder') {
            entryIcon = 'dropbox-icon-folder';
            onClick = () => this.drawFolderContents(entry.path_lower);
        } else if (entry['.tag'] === 'file') {
            entryIcon = 'dropbox-icon-file';
            selectableClass = this.isSelectable(entry) ? '' : 'dropbox-not-selectable';
            onClick = () => this.toggleEntrySelection(entry);
        } else {
            entryIcon = 'dropbox-icon-level-up';
            onClick = () => this.drawFolderContents(entry.path_lower);
        }
        const previewStyle={};
        if (entry.thumbnailUrl) {
            previewStyle.backgroundImage = `url(${entry.thumbnailUrl})`;
            entryIcon += ' dropbox-entry-preview';
        }
        return (
            <div
                className={`dropbox-entry-full-name ${selectableClass}`}
                onClick={onClick}
            >
                <div className={`dropbox-entry-icon ${entryIcon}`} style={previewStyle} />
                <div className="dropbox-entry-name">{entry.name}</div>
            </div>);
    }

    isSelectable(entry) {
        const fileExtension = entry.name.split('.').pop();
        const isAllowedFormat = this.state.allowedExtensions ? this.state.allowedExtensions.includes(fileExtension) : true;
        return entry['.tag'] !== 'file' || isAllowedFormat;
    }

    isSelected(entry) {
        return this.state.selectedEntries.some(e => e.id === entry.id);
    }

    toggleEntrySelection(entry) {
        if (!this.props.isMultiple) {
            this.setState({ selectedEntries: [entry] });
            return;
        }
        const { selectedEntries } = this.state;
        const entryIndex = selectedEntries.findIndex(e => e.id === entry.id);
        if (entryIndex !== -1) {
            selectedEntries.splice(entryIndex, 1);
        } else {
            selectedEntries.push(entry);
        }
        this.setState({ selectedEntries });
    }

    renderItemCheckbox(entry) {
        if (!this.props.isMultiple && !this.props.allowFolderSelection) {
            return false;
        }
        const isFolderSelectionForbidden = entry['.tag'] === 'folder' && !this.props.allowFolderSelection;
        if (isFolderSelectionForbidden || !this.isSelectable(entry) || !entry['.tag']) {
            return (<div className="dropbox-entry-checkbox dropbox-not-selectable" />);
        }
        const isChecked = this.isSelected(entry);
        return (
            <div
                onClick={() => this.toggleEntrySelection(entry)}
                className={`dropbox-entry-checkbox ${isChecked ? 'checked' : ''}`}
            />);
    }

    renderBreadcrumbs() {
        return (<ul className="dropbox-breadcrumbs">
            {this.state.breadcrumbs.map(breadcrumb => (<li className="dropbox-breadcrumb-item" key={breadcrumb.path}>
                <a href="javascript:;" onClick={() => this.drawFolderContents(breadcrumb.path)}>{breadcrumb.name}</a>
            </li>))}
        </ul>)
    }

    renderChooserInfo() {
        if (!this.props.isMultiple || this.props.hideCountLabel) {
            return false;
        }
        return `You've selected ${this.state.selectedEntries.length} entries`;
    }

    //dropbox-grid-layout .dropbox-button-selected
    renderHeader() {
        return (<div className="dropbox-chooser-header">
            <div className="dropbox-chooser-breadcrumbs">{this.renderBreadcrumbs()}</div>
            <div className="dropbox-chooser-options-panel">
                <button
                    className={`dropbox-layout-button dropbox-grid-icon ${this.state.layoutMode === 'grid' ? 'dropbox-button-selected' : ''}`}
                    onClick={() => this.setState({ layoutMode: 'grid' })}
                />
                <button
                    className={`dropbox-layout-button dropbox-list-icon ${this.state.layoutMode === 'list' ? 'dropbox-button-selected' : ''}`}
                    onClick={() => this.setState({ layoutMode: 'list' })}
                />
            </div>
        </div>)
    }

    renderLoader() {
        if (!this.state.isLoading) {
            return false;
        }
        return (<div className="dropbox-loader-modal">
            <div className="dropbox-loader">
                <div className="lds-dual-ring" />
            </div>
        </div>)
    }

    renderChooserButtons() {
        const chooseButtonClasses = this.state.selectedEntries.length ? '' : 'dropbox-not-selectable';
        return (
            <div className="dropbox-choose-buttons">
                <button className="dropbox-btn dropbox-btn-empty" onClick={() => this.destroy()}>Cancel</button>
                <button className={`dropbox-btn ${chooseButtonClasses} dropbox-btn-empty dropbox-btn-accent`} onClick={() => this.select()}>Choose</button>
            </div>);
    }

    destroy() {
        render(null, document.body, this.base);
    }

    select() {
        const result = this.props.isMultiple ? this.state.selectedEntries : this.state.selectedEntries[0];
        this.props.onPicked(result);
        this.destroy();
    }

    renderPicker() {
        return (
            <div className="dropbox-file-picker">
                {this.renderHeader()}
                <div className="dropbox-modal-body">
                    {this.renderLoader()}
                    <div className={`dropbox-entries-list dropbox-${this.state.layoutMode}-layout`}>
                        {this.state.list.entries.map(entry => this.renderItem(entry))}
                    </div>
                </div>
                <div className="dropbox-button-panel">
                    <div className="dropbox-info-panel">
                        {this.renderChooserInfo()}
                    </div>
                    {this.renderChooserButtons()}
                </div>
            </div>);
    }

    render() {
        return (<div className="dropbox-modal">{this.renderPicker()}</div>);
    }
}

const open = settings => new Promise((resolve) => {
    render(
        <DropboxFilePicker
            {...settings}
            onPicked={response => resolve(response)
        } />, document.body);
});

module.exports = { open };
