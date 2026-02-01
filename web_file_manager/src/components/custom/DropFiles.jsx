import React, { useEffect, useState } from 'react';
import '../../styles/DropFiles.css';
import api from '../../api/axios';

function DropFiles({parentId}) {
    
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

    //If the file is more larger than 100MB send it in parts?
    async function uploadFiles(files) {
        const formData = new FormData();
        Array.from(files).forEach(file => { console.log(file); formData.append('files[]', file); });

        formData.append('parent_id', parentId);
        
        try {
            const response = await api.post('/upload_files', formData,{
                headers:{
                    "Content-Type": "multipart/form-data"
                }
            });
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