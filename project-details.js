class ProjectDetailsManager {
    constructor(projectId) {
        // DOM Element References
        this.project = document.getElementById(projectId);
        this.toggleBtn = this.project.querySelector(`#toggleDetailsBtn${projectId.slice(-1)}`);
        this.detailsContainer = this.project.querySelector(`#detailsContainer${projectId.slice(-1)}`);
        this.inputs = this.project.querySelectorAll('input, textarea, select');
        this.projectId = projectId; // Store project ID for use in storage keys

        // Initialize toggle state from localStorage
        const isHidden = localStorage.getItem(`${this.projectId}_isHidden`) === 'true';
        if (isHidden) {
            this.detailsContainer.classList.add('hidden');
            this.toggleBtn.textContent = 'Show Details';
        } else {
            this.detailsContainer.classList.remove('hidden');
            this.toggleBtn.textContent = 'Hide Details';
        }

        // Bind methods
        this.initializeEventListeners();
        this.loadSavedData();
        
        // Initialize textareas with saved heights
        this.initializeTextareaHeights();
    }

    initializeEventListeners() {
        // Remove any existing click listeners
        this.toggleBtn.removeEventListener('click', () => this.toggleDetailsVisibility());
        // Add new click listener
        this.toggleBtn.addEventListener('click', () => this.toggleDetailsVisibility());

        // Auto-save Event Listeners for Inputs
        this.inputs.forEach(input => {
            input.addEventListener('change', () => this.saveInputData(input));
            input.addEventListener('input', () => this.saveInputData(input));
        });
    }

    toggleDetailsVisibility() {
        const isHidden = this.detailsContainer.classList.toggle('hidden');
        this.toggleBtn.textContent = isHidden ? 'Show Details' : 'Hide Details';
        // Save toggle state
        localStorage.setItem(`${this.projectId}_isHidden`, isHidden);
    }

    saveInputData(input) {
        try {
            // Generate unique storage key using project ID
            const storageKey = `${this.projectId}_${input.id}`;
            
            // Save input value to localStorage
            localStorage.setItem(storageKey, input.value);
            
            // Add visual feedback
            input.style.transition = 'all 0.3s ease';
            input.style.borderColor = '#4CAF50';
            input.style.backgroundColor = '#f0fff0';
            
            // Show "Saved!" message
            const savedMsg = document.createElement('span');
            savedMsg.textContent = 'Saved!';
            savedMsg.style.color = '#4CAF50';
            savedMsg.style.marginLeft = '10px';
            savedMsg.style.fontSize = '0.8em';
            input.parentNode.appendChild(savedMsg);
            
            // Remove visual feedback after delay
            setTimeout(() => {
                input.style.borderColor = '';
                input.style.backgroundColor = '';
                savedMsg.remove();
            }, 1500);
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    loadSavedData() {
        // Restore saved data for each input
        this.inputs.forEach(input => {
            const storageKey = `${this.projectId}_${input.id}`;
            const savedValue = localStorage.getItem(storageKey);
            
            if (savedValue !== null) {
                input.value = savedValue;
            }
        });
    }

    // Optional: Method to clear saved data
    clearSavedData() {
        this.inputs.forEach(input => {
            const storageKey = `${this.projectId}_${input.id}`;
            localStorage.removeItem(storageKey);
            input.value = ''; // Reset input field
        });
    }
    
    initializeTextareaHeights() {
        this.project.querySelectorAll('textarea').forEach(textarea => {
            const savedHeight = localStorage.getItem(`${this.projectId}_${textarea.id}_height`);
            const savedWidth = localStorage.getItem(`${this.projectId}_${textarea.id}_width`);
            
            if (savedHeight) textarea.style.height = savedHeight;
            if (savedWidth) textarea.style.width = savedWidth;
            
            // Add resize event listener
            textarea.addEventListener('mouseup', () => {
                localStorage.setItem(`${this.projectId}_${textarea.id}_height`, textarea.style.height);
                localStorage.setItem(`${this.projectId}_${textarea.id}_width`, textarea.style.width);
            });
        });
    }
}

// Initialize the Project Details Manager for both projects
document.addEventListener('DOMContentLoaded', () => {
    const project1Manager = new ProjectDetailsManager('project1');
    const project2Manager = new ProjectDetailsManager('project2');
});
