// Function to escape HTML content to raw code
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document.addEventListener('DOMContentLoaded', () => {
    const directoryTree = document.getElementById('directoryTree');
    const ul = document.createElement('ul');
    directoryTree.appendChild(ul);

    // Fetch the current structure on load
    fetch('/api/current-structure')
        .then(response => response.json())
        .then(data => {
            renderDirectoryTree(ul, data);
        })
        .catch(err => console.error('Error fetching current structure:', err));

    // Establish a connection with the SSE endpoint
    const eventSource = new EventSource('/api/updates');

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        ul.innerHTML = '';  // Clear previous tree structure
        renderDirectoryTree(ul, data);
    };

    eventSource.onerror = (error) => {
        console.error('Error with SSE:', error);
    };
});

// Function to render the folder structure
function renderDirectoryTree(container, node) {
    const listItem = document.createElement('li');

    if (node.isDir) {
        listItem.textContent = node.name;
        listItem.classList.add('directory');

        const updateCount = document.createElement('span');
        updateCount.classList.add('update-count');
        if (node.updatedFileCount > 0) {
            updateCount.textContent = ` (${node.updatedFileCount})`;
            listItem.classList.add('updated');
            listItem.appendChild(updateCount);
        }

        const ul = document.createElement('ul');
        ul.style.display = 'none';

        node.children.forEach(child => {
            renderDirectoryTree(ul, child);
        });

        listItem.addEventListener('click', function (e) {
            e.stopPropagation();

            if (ul.style.display === 'none') {
                ul.style.display = 'block';
            } else {
                ul.style.display = 'none';
            }

            listItem.classList.toggle('open');
        });

        listItem.appendChild(ul);
    } else {
        listItem.textContent = node.name;
        listItem.classList.add('file');

        // Show the file checksum in bold if it is updated
        const changeCount = document.createElement('span');
        changeCount.classList.add('change-count');
        if (node.isUpdated) {
            changeCount.textContent = ` +${node.changeCount}`;
            listItem.classList.add('updated');
            listItem.appendChild(changeCount);
            listItem.style.fontWeight = 'bold'; // Set bold for updated files
        }

        listItem.addEventListener('click', function () {
            fetch(`/api/file-content?path=${node.path}`)
                .then(response => response.text())
                .then(content => {
                    const escapedContent = escapeHtml(content);
                    document.getElementById('mainContent').innerHTML = `<h1>${node.name}</h1><pre>${escapedContent}</pre>`;

                    // Reset selection styles
                    const allFiles = document.querySelectorAll('.file, .directory');
                    allFiles.forEach(item => {
                        item.classList.remove('selected');
                    });

                    // Highlight the selected file
                    listItem.classList.add('selected');

                    // Remove update count for the clicked file
                    listItem.classList.remove('updated');
                    const countSpan = listItem.querySelector('.change-count');
                    if (countSpan) {
                        countSpan.remove();
                    }

                    // Remove the update count from parent folders if no more updated files are present
                    let parent = listItem.parentElement;
                    while (parent && parent.tagName !== 'UL') {
                        const parentLi = parent.closest('li.directory');
                        if (parentLi) {
                            const updatedFiles = parentLi.querySelectorAll('.file.updated').length;
                            const parentCountSpan = parentLi.querySelector('.update-count');

                            if (updatedFiles === 0 && parentCountSpan) {
                                parentLi.classList.remove('updated');
                                parentCountSpan.remove();
                            }
                        }
                        parent = parent.parentElement;
                    }
                })
                .catch(err => console.error('Error fetching file content:', err));
        });
    }

    container.appendChild(listItem);
}
