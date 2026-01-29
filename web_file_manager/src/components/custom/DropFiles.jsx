import React, { useEffect, useState } from 'react';
import '../../styles/DropFiles.css';
import api from '../../api/axios';

function DropFiles() {
    
    function preventDefaults (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDrop(e) {
        let dt = e.dataTransfer;
        uploadFiles(dt.files);
    }

    function handleChange(e){
        let files = e.target.files;
        uploadFiles(files);
    }

    async function uploadFiles(files) {
        const formData = new FormData();
        files.forEach(file => { formData.append('files[]', file); });
        
        try {
            const response = await api.post('/upload_files', formData);
            console.log(response);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect ( () => {

        let dropArea = document.getElementById('drop-area');
    
        // Prevents the browser opens the file
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });
    
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false);
        });
    
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'), false);
        });
    
        dropArea.addEventListener('drop', handleDrop, false);
    }, []);

    return (
    <>
        <div id="drop-area">
            <form className="my-form">
                <p>Drop your files here or cilck on select files</p>
                <input type="file" id="fileElem" multiple onChange={handleChange} />
                <label className="button" htmlFor="fileElem">Select files</label>
            </form>
            <div id="gallery"></div> 
        </div>
    </>
    );
}
export default DropFiles;