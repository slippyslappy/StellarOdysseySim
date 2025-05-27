// Sample data for testing
const sampleData = {
    "systems": [
        {
            "coordinate_x": 250,
            "coordinate_y": 1750,
            "name": "Aldebaran",
            "_id": "680d553f4f2c6ad94aea1775"
        },
        {
            "coordinate_x": 250,
            "coordinate_y": 1000,
            "name": "Sirius",
            "_id": "680d553f4f2c6ad94aea177a"
        },
        {
            "coordinate_x": 250,
            "coordinate_y": 250,
            "name": "Therion",
            "_id": "680d553f4f2c6ad94aea177e"
        },
        {
            "coordinate_x": 1000,
            "coordinate_y": 1750,
            "name": "Nyxar",
            "_id": "680d553f4f2c6ad94aea1783"
        },
        {
            "coordinate_x": 1000,
            "coordinate_y": 1000,
            "name": "Sun",
            "_id": "680d553f4f2c6ad94aea1788"
        },
        {
            "coordinate_x": 1000,
            "coordinate_y": 250,
            "name": "Vega",
            "_id": "680d553f4f2c6ad94aea178d"
        },
        {
            "coordinate_x": 1750,
            "coordinate_y": 1750,
            "name": "Antares",
            "_id": "680d553f4f2c6ad94aea1791"
        },
        {
            "coordinate_x": 1750,
            "coordinate_y": 1000,
            "name": "Rigel",
            "_id": "680d553f4f2c6ad94aea1795"
        },
        {
            "coordinate_x": 1750,
            "coordinate_y": 250,
            "name": "Polaris",
            "_id": "680d553f4f2c6ad94aea1799"
        }
    ]
};

class UniverseMap {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.systems = [];
        this.hoveredSystem = null;
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.zoomLevel = 1;
        this.zoomCenterX = 0;
        this.zoomCenterY = 0;
        this.playerPosition = null;
        this.pulseAnimation = null;
        this.pulsePhase = 0;

        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Add event listeners
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
    }

    resizeCanvas() {
        // Make canvas responsive while maintaining aspect ratio
        const container = this.canvas.parentElement;
        const size = Math.min(container.clientWidth, container.clientHeight);
        this.canvas.width = size;
        this.canvas.height = size;
        this.draw();
    }

    loadSystems(data) {
        this.systems = data.systems;
        this.draw();
    }

    setPlayerPosition(position) {
        this.playerPosition = position;
        if (this.pulseAnimation) {
            cancelAnimationFrame(this.pulseAnimation);
        }
        this.startPulseAnimation();
    }

    startPulseAnimation() {
        const animate = () => {
            this.pulsePhase = (this.pulsePhase + 0.05) % (Math.PI * 2);
            this.draw();
            this.pulseAnimation = requestAnimationFrame(animate);
        };
        this.pulseAnimation = requestAnimationFrame(animate);
    }

    draw() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = {
            left: 40,
            right: 40,
            top: 25,
            bottom: 25
        };
        const graphWidth = width - padding.left - padding.right;
        const graphHeight = height - padding.top - padding.bottom;

        // Clear canvas
        ctx.fillStyle = '#181c24';
        ctx.fillRect(0, 0, width, height);

        // Set text style for coordinates
        ctx.font = '12px Arial';
        ctx.fillStyle = '#e6eaf3';

        // Draw grid and coordinates
        ctx.strokeStyle = '#2c3242';
        ctx.lineWidth = 1;

        // Calculate visible range based on zoom and offset
        const visibleRange = 2000 / this.zoomLevel;
        const startX = Math.max(0, Math.floor(this.offsetX / 250) * 250);
        const endX = Math.min(2000, Math.ceil((this.offsetX + visibleRange) / 250) * 250);
        const startY = Math.max(0, Math.floor(this.offsetY / 250) * 250);
        const endY = Math.min(2000, Math.ceil((this.offsetY + visibleRange) / 250) * 250);

        // Function to convert coordinate to pixel position
        const toPixelX = (x) => padding.left + ((x - this.offsetX) / 2000) * graphWidth * this.zoomLevel;
        const toPixelY = (y) => height - padding.bottom - ((y - this.offsetY) / 2000) * graphHeight * this.zoomLevel;

        // Draw the four edges of the graph first
        ctx.beginPath();
        // Left edge
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, height - padding.bottom);
        // Bottom edge
        ctx.lineTo(width - padding.right, height - padding.bottom);
        // Right edge
        ctx.lineTo(width - padding.right, padding.top);
        // Top edge
        ctx.lineTo(padding.left, padding.top);
        ctx.stroke();
        
        // Draw vertical lines and x-coordinates
        for (let i = startX; i <= endX; i += 250) {
            const x = toPixelX(i);
            
            // Only draw grid lines within the graph boundaries
            if (x >= padding.left && x <= width - padding.right) {
                // Draw grid line
                ctx.beginPath();
                ctx.moveTo(x, padding.top);
                ctx.lineTo(x, height - padding.bottom);
                ctx.stroke();
            }

            // Draw bottom tick and label
            ctx.beginPath();
            ctx.moveTo(x, height - padding.bottom);
            ctx.lineTo(x, height - padding.bottom + 5);
            ctx.stroke();
            ctx.textAlign = 'center';
            ctx.fillText(i.toString(), x, height - padding.bottom + 20);

            // Draw top tick and label
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, padding.top - 5);
            ctx.stroke();
            ctx.fillText(i.toString(), x, padding.top - 10);
        }

        // Draw horizontal lines and y-coordinates
        for (let i = startY; i <= endY; i += 250) {
            const y = toPixelY(i);
            
            // Only draw grid lines within the graph boundaries
            if (y >= padding.top && y <= height - padding.bottom) {
                // Draw grid line
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(width - padding.right, y);
                ctx.stroke();
            }

            // Draw left tick and label
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left - 5, y);
            ctx.stroke();
            ctx.textAlign = 'right';
            ctx.fillText(i.toString(), padding.left - 10, y + 4);

            // Draw right tick and label
            ctx.beginPath();
            ctx.moveTo(width - padding.right, y);
            ctx.lineTo(width - padding.right + 5, y);
            ctx.stroke();
            ctx.textAlign = 'left';
            ctx.fillText(i.toString(), width - padding.right + 10, y + 4);
        }

        // Reset text alignment for system names
        ctx.textAlign = 'center';

        // Draw player position if available
        if (this.playerPosition) {
            const x = toPixelX(this.playerPosition.coordinate_x);
            const y = toPixelY(this.playerPosition.coordinate_y);

            // Only draw if within visible area and graph boundaries
            if (x >= padding.left && x <= width - padding.right &&
                y >= padding.top && y <= height - padding.bottom) {
                
                // Draw pulsating circles
                const pulseSize = 15 + Math.sin(this.pulsePhase) * 5;
                const pulseOpacity = 0.5 + Math.sin(this.pulsePhase) * 0.3;

                // Outer circle
                ctx.beginPath();
                ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 255, 255, ${pulseOpacity})`;
                ctx.lineWidth = 2;
                ctx.stroke();

                // Inner circle
                ctx.beginPath();
                ctx.arc(x, y, pulseSize * 0.6, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 255, 255, ${pulseOpacity})`;
                ctx.lineWidth = 2;
                ctx.stroke();

                // Center dot
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fillStyle = 'white';
                ctx.fill();
            }
        }

        // Draw systems
        this.systems.forEach((system, index) => {
            const x = toPixelX(system.coordinate_x);
            const y = toPixelY(system.coordinate_y);

            // Only draw systems that are within the visible area and graph boundaries
            if (x >= padding.left && x <= width - padding.right &&
                y >= padding.top && y <= height - padding.bottom) {
                
                // Set color based on whether it's a starter system (first 9) or not
                ctx.fillStyle = index < 9 ? '#4CAF50' : '#FF5252';
                
                // Draw system point as a square (2x2 pixels)
                const size = this.hoveredSystem === system ? 7 : 5;
                ctx.fillRect(x - size/2, y - size/2, size, size);

                // Draw system name if hovered
                if (this.hoveredSystem === system) {
                    ctx.font = '14px Arial';
                    ctx.fillStyle = '#e6eaf3';
                    ctx.textAlign = 'center';
                    ctx.fillText(system.name, x, y - 10);
                }
            }
        });
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const padding = {
            left: 40,
            right: 40,
            top: 25,
            bottom: 25
        };
        const graphWidth = this.canvas.width - padding.left - padding.right;
        const graphHeight = this.canvas.height - padding.top - padding.bottom;

        if (this.isDragging) {
            // Calculate the movement in coordinate space
            const dx = (x - this.lastX) / (graphWidth * this.zoomLevel) * 2000;
            const dy = (y - this.lastY) / (graphHeight * this.zoomLevel) * 2000;
            
            // Update offset (negative because we want to move the map in the opposite direction of the drag)
            this.offsetX -= dx;
            this.offsetY += dy; // Positive because y-axis is inverted

            // Ensure the offset stays within bounds
            const maxOffset = 2000 * (1 - 1/this.zoomLevel);
            this.offsetX = Math.max(0, Math.min(maxOffset, this.offsetX));
            this.offsetY = Math.max(0, Math.min(maxOffset, this.offsetY));

            this.lastX = x;
            this.lastY = y;
            this.draw();
            return;
        }

        // Check if mouse is over any system
        let found = false;

        for (const system of this.systems) {
            const systemX = padding.left + ((system.coordinate_x - this.offsetX) / 2000) * graphWidth * this.zoomLevel;
            const systemY = this.canvas.height - padding.bottom - ((system.coordinate_y - this.offsetY) / 2000) * graphHeight * this.zoomLevel;
            const distance = Math.sqrt(Math.pow(x - systemX, 2) + Math.pow(y - systemY, 2));

            if (distance < 10) {
                this.hoveredSystem = system;
                found = true;
                break;
            }
        }

        if (!found) {
            this.hoveredSystem = null;
        }

        this.draw();
    }

    handleMouseDown(e) {
        this.isDragging = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
    }

    handleMouseUp() {
        this.isDragging = false;
    }

    handleWheel(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Calculate the coordinate under the mouse before zoom
        const padding = {
            left: 40,
            right: 40,
            top: 25,
            bottom: 25
        };
        const graphWidth = this.canvas.width - padding.left - padding.right;
        const graphHeight = this.canvas.height - padding.top - padding.bottom;
        
        const coordX = this.offsetX + ((mouseX - padding.left) / (graphWidth * this.zoomLevel)) * 2000;
        const coordY = this.offsetY + ((this.canvas.height - mouseY - padding.bottom) / (graphHeight * this.zoomLevel)) * 2000;

        // Update zoom level
        const delta = e.deltaY;
        const zoomFactor = delta > 0 ? 0.9 : 1.1;
        const newZoomLevel = this.zoomLevel * zoomFactor;
        
        // Prevent zooming out beyond initial view
        if (newZoomLevel < 1) {
            this.zoomLevel = 1;
            this.offsetX = 0;
            this.offsetY = 0;
            this.draw();
            return;
        }
        
        // Limit maximum zoom (increased by 100%)
        this.zoomLevel = Math.min(100, newZoomLevel);

        // Calculate new offset to keep the point under the mouse in the same position
        const newCoordX = this.offsetX + ((mouseX - padding.left) / (graphWidth * this.zoomLevel)) * 2000;
        const newCoordY = this.offsetY + ((this.canvas.height - mouseY - padding.bottom) / (graphHeight * this.zoomLevel)) * 2000;
        
        this.offsetX += (coordX - newCoordX);
        this.offsetY += (coordY - newCoordY);

        // Ensure the offset stays within bounds
        const maxOffset = 2000 * (1 - 1/this.zoomLevel);
        this.offsetX = Math.max(0, Math.min(maxOffset, this.offsetX));
        this.offsetY = Math.max(0, Math.min(maxOffset, this.offsetY));

        this.draw();
    }
}

// Initialize the map when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    let universeMap = null;

    // Function to initialize the map
    function initializeMap() {
        if (!universeMap) {
            universeMap = new UniverseMap('universeMap');
        }
        universeMap.draw();
    }

    // Add button to load systems
    const loadButton = document.getElementById('loadSystemsBtn');
    const apiKeyInput = document.getElementById('systems_api_key');
    
    // Load saved API key from localStorage
    if (apiKeyInput) {
        const savedApiKey = localStorage.getItem('systems_api_key');
        if (savedApiKey) {
            apiKeyInput.value = savedApiKey;
        }
    }
    
    if (loadButton && apiKeyInput) {
        loadButton.addEventListener('click', async () => {
            const apiKey = apiKeyInput.value.trim();
            if (!apiKey) {
                alert('Please enter your API key');
                return;
            }

            // Save API key to localStorage
            localStorage.setItem('systems_api_key', apiKey);

            try {
                loadButton.disabled = true;
                loadButton.textContent = 'Loading...';

                // Load systems
                const systemsResponse = await fetch('https://api.stellarodyssey.app/api/public/systems', {
                    headers: {
                        'Accept': 'application/json',
                        'sodyssey-api-key': apiKey
                    }
                });

                if (!systemsResponse.ok) {
                    throw new Error(`Server responded with status ${systemsResponse.status}`);
                }

                const systemsData = await systemsResponse.json();
                universeMap.loadSystems(systemsData);

                // Add a 1 second delay between requests
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Load journal
                const journalResponse = await fetch('https://api.stellarodyssey.app/api/public/journal', {
                    headers: {
                        'Accept': 'application/json',
                        'sodyssey-api-key': apiKey
                    }
                });

                if (!journalResponse.ok) {
                    throw new Error(`Server responded with status ${journalResponse.status}`);
                }

                const journalData = await journalResponse.json();
                if (journalData.fullJournal && journalData.fullJournal.length > 0) {
                    universeMap.setPlayerPosition(journalData.fullJournal[0]);
                }
                
                loadButton.disabled = false;
                loadButton.textContent = 'Load Systems';
            } catch (error) {
                alert('Failed to load data: ' + error.message);
                loadButton.disabled = false;
                loadButton.textContent = 'Load Systems';
            }
        });
    }

    // Add event listener for tab switching
    const universeMapTab = document.querySelector('.tab[data-tab="universe-map-tab"]');
    if (universeMapTab) {
        universeMapTab.addEventListener('click', () => {
            // Initialize and draw the map when switching to the universe map tab
            initializeMap();
        });
    }

    // Initialize the map immediately if we're on the universe map tab
    if (document.getElementById('universe-map-tab').classList.contains('active')) {
        initializeMap();
    }
}); 