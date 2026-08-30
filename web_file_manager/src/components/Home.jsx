import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { UPLOAD_EVENT } from './custom/GlobalDropUpload';
import Loading from './custom/Loading';
import FileList from './custom/FileList';
import BreadCrumbs from './custom/BreadCrumbs';
import Modal from './modals/Modal';
import MoveToDialog from './modals/MoveToDialog';
import DropFiles from './custom/DropFiles';
import Icon from './custom/Icon';
import { downloadFiles, readDownloadError } from '../utils/download';

const MAX_NAME = 255;
const DIRECTORY = 1;

function Home() {
  // The open folder lives in the URL, so it survives a reload and search results
  // can link straight into it.
  const [searchParams, setSearchParams] = useSearchParams();
  const folderParam = searchParams.get('folder');
  const parent = folderParam === null || folderParam === '' ? null : Number(folderParam);

  const [loadingComplete, setLoadingComplete] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [items, setItems] = useState([]);

  const [modalNewFolderOpen, setModalNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderError, setFolderError] = useState('');
  const [savingFolder, setSavingFolder] = useState(false);

  // What the open dialog acts on. The toolbar passes the selection, a row menu
  // passes just that row, so both paths reach the same three operations.
  const [actionItems, setActionItems] = useState([]);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState('');
  const [renaming, setRenaming] = useState(false);

  const [moveOpen, setMoveOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [downloadError, setDownloadError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const [moveError, setMoveError] = useState('');
  // What is currently being dragged, shared with the listing and the crumbs:
  // `dragover` cannot read the payload, only its type, so it lives here.
  const dragRef = useRef(null);

  // Directories and files arrive in two lists; the table shows one.
  const combineDirectoriesAndFiles = (data) => {
    const directories = (data.directories ?? []).map((item) => ({
      ...item,
      type: DIRECTORY,
      extension: '',
      size: 0,
      checked: false,
    }));
    const files = (data.files ?? []).map((item) => ({ ...item, type: 2, checked: false }));

    setItems([...directories, ...files]);
    // reverse() mutates, so copy before flipping the server's order.
    setBreadcrumbs([...(data.breadcrumbs ?? [])].reverse());
  };

  const getDirectory = useCallback(async () => {
    setLoadingComplete(false);
    setLoadError('');
    try {
      const response = await api.post('/get_directory', { parent_id: parent });
      combineDirectoriesAndFiles(response.data);
    } catch (error) {
      console.error('Error getting directory:', error);
      setLoadError('This folder could not be loaded.');
    } finally {
      // Without this the spinner used to run forever on any failure.
      setLoadingComplete(true);
    }
  }, [parent]);

  useEffect(() => {
    getDirectory();
  }, [getDirectory]);

  // A drop anywhere on the app uploads into this folder; reload when it does.
  useEffect(() => {
    const handleUploaded = (evt) => {
      if ((evt.detail?.parentId ?? null) === parent) getDirectory();
    };
    window.addEventListener(UPLOAD_EVENT, handleUploaded);
    return () => window.removeEventListener(UPLOAD_EVENT, handleUploaded);
  }, [parent, getDirectory]);

  const goFolder = (folderId) => {
    if (folderId == null) setSearchParams({});
    else setSearchParams({ folder: String(folderId) });
  };

  const selected = items.filter((item) => item.checked);
  const selectedFiles = selected.filter((item) => item.type !== DIRECTORY);

  /* -- Download --------------------------------------------------------- */

  // Both entry points land here: the toolbar passes the selection, a row menu
  // (or a double click on a file) passes that one row.
  const downloadItems = async (targets) => {
    const files = targets.filter((item) => item.type !== DIRECTORY);

    if (files.length === 0) {
      // Folders would have to be zipped server-side first; nothing does that yet.
      setDownloadError('Folders cannot be downloaded yet. Select files instead.');
      return;
    }

    setDownloadError('');
    setDownloading(true);
    try {
      await downloadFiles(files);
    } catch (error) {
      console.error('Error downloading files:', error);
      setDownloadError(await readDownloadError(error));
    } finally {
      setDownloading(false);
    }
  };

  /* -- Move ------------------------------------------------------------- */

  // Throws on failure so the dialog can show the reason; the drag path catches.
  const performMove = async (payload, targetId) => {
    if (!payload || payload.length === 0) return;

    const items_ = payload.map((item) => ({ id: item.id, type: item.type }));
    try {
      await api.post('/move_items', { items: items_, target_id: targetId ?? null });
      getDirectory();
    } catch (error) {
      console.error('Error moving items:', error);
      throw new Error(error.response?.data?.error ?? 'The items could not be moved.');
    }
  };

  const moveByDrag = async (payload, targetId) => {
    // Dropping something back where it already is costs a request for nothing.
    if ((targetId ?? null) === parent) return;

    setMoveError('');
    try {
      await performMove(payload, targetId);
    } catch (error) {
      setMoveError(error.message);
    }
  };

  const openMove = (targets) => {
    if (targets.length === 0) return;
    setActionItems(targets);
    setMoveError('');
    setMoveOpen(true);
  };

  /* -- New folder ------------------------------------------------------- */

  const closeModalNewFolder = () => {
    setNewFolderName('');
    setFolderError('');
    setModalNewFolderOpen(false);
  };

  const createNewFolder = async () => {
    const name = newFolderName.trim();

    // The old check compared a string against a number, so it never fired.
    if (name === '') {
      setFolderError('The name cannot be empty.');
      return;
    }
    if (name.length > MAX_NAME) {
      setFolderError(`The name cannot be longer than ${MAX_NAME} characters.`);
      return;
    }

    setSavingFolder(true);
    try {
      await api.post('/create_new_folder', { name, parent_id: parent });
      closeModalNewFolder();
      getDirectory();
    } catch (error) {
      console.error('Error creating folder:', error);
      setFolderError('The folder could not be created.');
    } finally {
      setSavingFolder(false);
    }
  };

  /* -- Rename ----------------------------------------------------------- */

  const openRename = (targets) => {
    if (targets.length !== 1) return;
    setActionItems(targets);
    setRenameValue(targets[0].name);
    setRenameError('');
    setRenameOpen(true);
  };

  const closeRename = () => {
    setRenameOpen(false);
    setRenameError('');
  };

  const renameItem = async () => {
    const name = renameValue.trim();
    const item = actionItems[0];

    if (!item) return;
    if (name === '') {
      setRenameError('The name cannot be empty.');
      return;
    }
    if (name.length > MAX_NAME) {
      setRenameError(`The name cannot be longer than ${MAX_NAME} characters.`);
      return;
    }

    setRenaming(true);
    try {
      await api.post('/rename_item', { id: item.id, type: item.type, name });
      closeRename();
      getDirectory();
    } catch (error) {
      console.error('Error renaming item:', error);
      setRenameError('The item could not be renamed.');
    } finally {
      setRenaming(false);
    }
  };

  /* -- Delete ----------------------------------------------------------- */

  const openDelete = (targets) => {
    if (targets.length === 0) return;
    setActionItems(targets);
    setDeleteError('');
    setDeleteOpen(true);
  };

  const deleteItems = async () => {
    setDeleting(true);
    try {
      await api.post('/delete_items', {
        items: actionItems.map((item) => ({ id: item.id, type: item.type })),
      });
      setDeleteOpen(false);
      getDirectory();
    } catch (error) {
      console.error('Error deleting items:', error);
      setDeleteError('The items could not be deleted.');
    } finally {
      setDeleting(false);
    }
  };

  const folderCount = actionItems.filter((item) => item.type === DIRECTORY).length;

  return (
    <>
      <div className='card'>
        <BreadCrumbs items={breadcrumbs} goFolder={goFolder} onMove={moveByDrag} dragRef={dragRef} />
      </div>

      <div className='card'>
        <div className='cluster' style={{ justifyContent: 'space-between' }}>
          <p className='kicker' style={{ margin: 0 }}>
            {selected.length > 0 ? `${selected.length} selected` : 'Files'}
          </p>

          <div className='cluster'>
            <button type='button' className='btn btn-primary' onClick={() => setModalNewFolderOpen(true)}>
              <Icon name='plus' size={16} /> New folder
            </button>

            {selected.length > 0 && (
              <>
                {selectedFiles.length > 0 && (
                  <button
                    type='button'
                    className='btn btn-secondary'
                    onClick={() => downloadItems(selected)}
                    disabled={downloading}
                    title={
                      selectedFiles.length === selected.length
                        ? 'Download'
                        : 'Only the selected files are downloaded; folders are skipped'
                    }
                  >
                    <Icon name='download' size={16} />
                    {downloading ? 'Downloading…' : `Download${selectedFiles.length > 1 ? ` (${selectedFiles.length})` : ''}`}
                  </button>
                )}
                <button
                  type='button'
                  className='btn btn-secondary'
                  onClick={() => openRename(selected)}
                  disabled={selected.length !== 1}
                  title={selected.length !== 1 ? 'Select a single item to rename it' : 'Rename'}
                >
                  <Icon name='pencil' size={16} /> Rename
                </button>
                <button type='button' className='btn btn-secondary' onClick={() => openMove(selected)}>
                  <Icon name='folder-input' size={16} /> Move to
                </button>
                <button type='button' className='btn btn-danger' onClick={() => openDelete(selected)}>
                  <Icon name='trash' size={16} /> Delete
                </button>
              </>
            )}
          </div>
        </div>

        <hr className='hr' />

        {!loadingComplete ? (
          <Loading />
        ) : loadError ? (
          <p className='field-error' role='alert'>{loadError}</p>
        ) : (
          <>
            {moveError && <p className='field-error' role='alert'>{moveError}</p>}
            {downloadError && <p className='field-error' role='alert'>{downloadError}</p>}
            <FileList
              items={items}
              setItems={setItems}
              goFolder={goFolder}
              onMove={moveByDrag}
              dragRef={dragRef}
              onRename={openRename}
              onMoveTo={openMove}
              onDelete={openDelete}
              onDownload={downloadItems}
            />
            <div className='section'>
              <DropFiles parentId={parent} onUploaded={getDirectory} />
            </div>
          </>
        )}
      </div>

      <Modal isOpen={modalNewFolderOpen} onClose={closeModalNewFolder} title='Create new folder'>
        <form
          onSubmit={(evt) => {
            evt.preventDefault();
            createNewFolder();
          }}
        >
          <div className='dialog-body'>
            <div className='field'>
              <label htmlFor='folder_name'>New folder name</label>
              <input
                id='folder_name'
                className='input'
                type='text'
                name='folder_name'
                placeholder='Name...'
                maxLength={MAX_NAME}
                value={newFolderName}
                onChange={(evt) => setNewFolderName(evt.target.value)}
                autoFocus
              />
              {folderError && <p className='field-error' role='alert'>{folderError}</p>}
            </div>
          </div>

          <div className='dialog-actions'>
            <button type='button' className='btn btn-secondary' onClick={closeModalNewFolder}>
              Cancel
            </button>
            <button type='submit' className='btn btn-primary' disabled={savingFolder}>
              {savingFolder ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={renameOpen} onClose={closeRename} title='Rename'>
        <form
          onSubmit={(evt) => {
            evt.preventDefault();
            renameItem();
          }}
        >
          <div className='dialog-body'>
            <div className='field'>
              <label htmlFor='item_name'>Name</label>
              <input
                id='item_name'
                className='input'
                type='text'
                maxLength={MAX_NAME}
                value={renameValue}
                onChange={(evt) => setRenameValue(evt.target.value)}
                autoFocus
              />
              {renameError && <p className='field-error' role='alert'>{renameError}</p>}
            </div>
          </div>

          <div className='dialog-actions'>
            <button type='button' className='btn btn-secondary' onClick={closeRename}>
              Cancel
            </button>
            <button type='submit' className='btn btn-primary' disabled={renaming}>
              {renaming ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <MoveToDialog
        isOpen={moveOpen}
        items={actionItems}
        currentParent={parent}
        onClose={() => setMoveOpen(false)}
        onMove={performMove}
      />

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title='Delete items'>
        <div className='dialog-body'>
          <p>
            {actionItems.length === 1
              ? `“${actionItems[0]?.name}” will be deleted.`
              : `${actionItems.length} items will be deleted.`}
          </p>
          {folderCount > 0 && (
            <p className='cluster' style={{ margin: 0 }}>
              <Icon name='alert-triangle' size={18} />
              {folderCount === 1
                ? 'A folder is included: everything inside it goes too.'
                : `${folderCount} folders are included: everything inside them goes too.`}
            </p>
          )}
          {deleteError && <p className='field-error' role='alert'>{deleteError}</p>}
        </div>

        <div className='dialog-actions'>
          <button type='button' className='btn btn-secondary' onClick={() => setDeleteOpen(false)}>
            Cancel
          </button>
          <button type='button' className='btn btn-danger' onClick={deleteItems} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>
    </>
  );
}

export default Home;
