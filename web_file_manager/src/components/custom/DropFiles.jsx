import React, { useEffect, useState } from 'react';
import '../../styles/DropFiles.css';

function DropFiles() {
  
    const [files, setFiles] = useState([]);


    
    
    function preventDefaults (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    

    function handleDrop(e) {
        let dt = e.dataTransfer;
        setFiles(dt.files);
        handleFiles();
    }

    function handleFiles() {
        ([...files]).forEach(uploadFile);
    }

    function uploadFile(file) {
        console.log("Subiendo archivo:", file.name);
        // Aquí usarías FormData y fetch() para enviarlo a tu servidor
    }

    useEffect ( () => {

        let dropArea = document.getElementById('drop-area');
    
        // Evitar que el navegador abra el archivo
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
                <input type="file" id="fileElem" multiple accept="image/*" onChange={handleFiles()} />
                <label className="button" htmlFor="fileElem">Select files</label>
            </form>
            <div id="gallery"></div> 
        </div>
    </>
    );
}
export default DropFiles;