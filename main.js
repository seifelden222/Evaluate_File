// main.js - clean structure
(function () {
  'use strict';

  function $id(id) { return document.getElementById(id); }

  function clearText(el) { if (el) el.textContent = ''; }

  function fileNameFromInput(input) {
    if (!input) return '';
    if (input.files && input.files.length > 0) return input.files[0].name || '';
    if (input.value) return String(input.value).split('\\').pop().split('/').pop();
    return '';
  }

  function validateAll() {
    const nameEl = $id('name');
    const phoneEl = $id('phone');
    const fileEl = $id('file');
    const noteEl = $id('note');
    const nameErr = $id('name_err');
    const phoneErr = $id('phone_err');
    const fileErr = $id('file_err');

    clearText(nameErr); clearText(phoneErr); clearText(fileErr);

    // Commented out - uncomment if you need to send these fields to backend
    // const name = (nameEl && nameEl.value || '').trim();
    // const phone = (phoneEl && phoneEl.value || '').trim();
    // const note = (noteEl && noteEl.value || '').trim();
    
    // Get file info (name + type)
    let fileName = '';
    let fileType = '';
    if (fileEl && fileEl.files && fileEl.files.length > 0) {
      fileName = fileEl.files[0].name || '';
      fileType = fileEl.files[0].type || '';
    } else if (fileEl && fileEl.value) {
      fileName = String(fileEl.value).split('\\').pop().split('/').pop();
    }

    let ok = true;
    // Only file is required; name, phone, note are optional
    if (!fileName) { 
      if (fileErr) fileErr.textContent = ' Please upload your file'; 
      ok = false; 
    }

    // Only send file and fileType to backend (name, phone, note not included)
    return { ok, data: { file: fileName, fileType: fileType } };
    
    // To include all fields, uncomment the line below and comment out the line above:
    // return { ok, data: { name, phone, file: fileName, fileType: fileType, note } };
  }

  function buildQuery(data) {
    // Only file and fileType
    return '?file=' + encodeURIComponent(data.file) +
      '&fileType=' + encodeURIComponent(data.fileType);
    
    // Uncomment below to include name, phone, note in query string:
    // return '?name=' + encodeURIComponent(data.name) +
    //   '&phone=' + encodeURIComponent(data.phone) +
    //   '&file=' + encodeURIComponent(data.file) +
    //   '&fileType=' + encodeURIComponent(data.fileType) +
    //   '&note=' + encodeURIComponent(data.note);
  }

  async function handleSubmit(ev) {
    if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
    if (ev && typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();

    const v = validateAll();
    if (!v.ok) return false;

    const fileEl = $id('file');
    
    // Send actual file to backend using FormData
    try {
      const formData = new FormData();
      if (fileEl && fileEl.files && fileEl.files.length > 0) {
        formData.append('file', fileEl.files[0]); // actual file
      }

      // Send file to backend endpoint
      // const resp = await fetch('http://127.0.0.1:8000/send_files', {
      const resp = await fetch('http://127.0.0.1:8000/send_file', {
        method: 'POST',
        body: formData, // FormData automatically sets correct Content-Type with boundary
      });

      if (resp && resp.ok) {
        const result = await resp.json();
        console.log('Upload success:', result);
        
        // After successful upload, redirect to get score
        window.location.href = 'http://127.0.0.1:8000/get_score';
        return true;
      } else {
        console.error('Upload failed:', resp.status, resp.statusText);
        alert('Upload failed. Please try again.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Error uploading file: ' + err.message);
    }

    return false;
  }

  document.addEventListener('DOMContentLoaded', function () {
    const form = $id('upload-form');
    if (form && form.addEventListener) form.addEventListener('submit', handleSubmit);
  });

})();
