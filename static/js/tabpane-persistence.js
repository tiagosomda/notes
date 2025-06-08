// Tabpane persistence functionality
// Handles URL parameters and localStorage for tab selection

document.addEventListener('DOMContentLoaded', function() {
    console.log('Tabpane persistence script loaded');
    const tabpanes = document.querySelectorAll('.tabpane[data-key]');
    console.log('Found tabpanes with keys:', tabpanes.length);
    
    tabpanes.forEach(function(tabpane) {
        const key = tabpane.getAttribute('data-key');
        const inputs = tabpane.querySelectorAll('.tabpane__input');
        console.log('Processing tabpane with key:', key, 'inputs:', inputs.length);
        
        if (!key || inputs.length === 0) {
            console.log('Skipping tabpane - no key or inputs');
            return;
        }
          // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const urlValue = urlParams.get(key);
        console.log('URL value for key', key + ':', urlValue);
        
        // Get localStorage value
        const storedValue = localStorage.getItem('tabpane-' + key);
        console.log('Stored value for key', key + ':', storedValue);
        
        // Determine which tab to select (priority: URL > localStorage > default selected)
        let targetLabel = urlValue || storedValue;
        let targetInput = null;
        console.log('Target label:', targetLabel);
          if (targetLabel) {
            // Find input with matching label
            inputs.forEach(function(input) {
                const inputLabel = input.getAttribute('data-label');
                console.log('Checking input with label:', inputLabel);
                if (inputLabel === targetLabel) {
                    targetInput = input;
                    console.log('Found matching input for label:', targetLabel);
                }
            });
        }
          // If we found a target input, select it
        if (targetInput) {
            console.log('Selecting target input:', targetInput.id);
            // Uncheck all inputs first
            inputs.forEach(function(input) {
                input.checked = false;
            });
            // Check the target input
            targetInput.checked = true;
        } else {
            console.log('No target input found, using default selection');
        }
          // Add event listeners to save selection to localStorage
        inputs.forEach(function(input) {
            input.addEventListener('change', function() {
                if (this.checked) {
                    const label = this.getAttribute('data-label');
                    console.log('Tab changed to:', label);
                    localStorage.setItem('tabpane-' + key, label);
                    
                    // Update URL parameter without reloading the page
                    const newUrl = new URL(window.location);
                    newUrl.searchParams.set(key, label);
                    window.history.replaceState({}, '', newUrl);
                    console.log('Updated URL and localStorage for key', key + ':', label);
                }
            });
        });
    });
});
