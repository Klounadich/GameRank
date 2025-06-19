document.addEventListener('DOMContentLoaded', function() {
    const Edit = document.querySelectorAll('.tier-label');
    const changeLabel = document.querySelectorAll('.edit-tier');
    const gameItems = document.querySelectorAll('.game-item');
    const tierContents = document.querySelectorAll('.tier-content');
    const gamesGrid = document.querySelector('.games-grid'); 

    
    const allDropZones = [...tierContents, gamesGrid];

    const editLabels = document.querySelectorAll('.edit-tier');

    editLabels.forEach(button => {
        button.addEventListener('click', function() {
            const tierRow = this.closest('.tier-row');
            const tierLabel = tierRow.querySelector('.tier-label');
            
            const input = document.createElement('input');
            input.type = 'text';
            input.value = tierLabel.textContent;
            input.className = 'tier-edit-input';

            tierLabel.replaceWith(input);
            input.focus();

            const saveEdit = () => {
                tierLabel.textContent = input.value;
                input.replaceWith(tierLabel);
                document.removeEventListener('keydown', handleKeyDown);
            };

            const handleKeyDown = (e) => {
                if (e.key === 'Enter') {
                    saveEdit();
                }
            };

            input.addEventListener('blur', saveEdit);
            document.addEventListener('keydown', handleKeyDown);
        });
    });
    gameItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        
        
        if (!item.dataset.gameId) {
            item.dataset.gameId = 'game-' + Math.random().toString(36).substr(2, 9);
        }
    });

    allDropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragenter', handleDragEnter);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });

    function handleDragStart(e) {
        this.classList.add('dragging');
        e.dataTransfer.setData('text/plain', this.dataset.gameId);
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    function handleDragEnter(e) {
        e.preventDefault();
        this.classList.add('drop-zone');
    }

    function handleDragLeave() {
        this.classList.remove('drop-zone');
    }

    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drop-zone');
        
        const gameId = e.dataTransfer.getData('text/plain');
        const draggedItem = document.querySelector(`.game-item[data-game-id="${gameId}"]`);
        
        if (!draggedItem) return;
        
        
        draggedItem.classList.remove('dragging');
       
        if (this.contains(draggedItem)) return;
        
        
        this.appendChild(draggedItem);
    }
});