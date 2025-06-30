document.addEventListener('DOMContentLoaded', function() {
    const Edit = document.querySelectorAll('.tier-label');
    const changeLabel = document.querySelectorAll('.edit-tier');
    const gameItems = document.querySelectorAll('.game-item');
    const tierContents = document.querySelectorAll('.tier-content');
    const gamesGrid = document.querySelector('.games-grid'); 

    
    const allDropZones = [...tierContents, gamesGrid];

    const editButtons = document.querySelectorAll('.edit-tier');

    editButtons.forEach(button => {
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
            
            
            tierLabel.style.width = input.style.width;
            tierLabel.style.fontSize = input.style.fontSize;
            
            input.replaceWith(tierLabel);
            document.removeEventListener('keydown', handleKeyDown);
        };

        
        const handleKeyDown = (e) => {
            if (e.key === 'Enter') saveEdit();
            if (e.key === 'Escape') input.replaceWith(tierLabel);
        };

        
        const resizeInput = () => {
            const tempSpan = document.createElement('span');
            tempSpan.style.visibility = 'hidden';
            tempSpan.style.whiteSpace = 'nowrap';
            tempSpan.style.font = window.getComputedStyle(input).font;
            tempSpan.textContent = input.value || 'A';
            
            document.body.appendChild(tempSpan);
            const newWidth = Math.min(tempSpan.offsetWidth + 20, 200);
            input.style.width = `${newWidth}px`;
            document.body.removeChild(tempSpan);
        };

        input.addEventListener('input', resizeInput);
        input.addEventListener('blur', saveEdit);
        document.addEventListener('keydown', handleKeyDown);
        
        
        resizeInput();
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
        const Input = document.getElementById('game-search-input');
        const SearchLabel = document.getElementById('search-dropdown');
        
        Input.addEventListener('click', () =>{
            SearchLabel.style.display='block';
        });
});