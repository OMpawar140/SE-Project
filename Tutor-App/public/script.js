document.getElementById('selectFolder').addEventListener('click', () => {
    const folderPath = prompt("Enter full folder path:");

    if (!folderPath) {
        document.getElementById('status').textContent = 'Folder path not provided.';
        return;
    }

    fetch('/select-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('status').textContent = data.message;
    })
    .catch(err => {
        document.getElementById('status').textContent = 'Error selecting folder';
    });
});

document.getElementById('postChanges').addEventListener('click', () => {
    fetch('/post-changes', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            document.getElementById('status').textContent = data.message;
        })
        .catch(err => {
            document.getElementById('status').textContent = 'Error posting changes';
        });
});
