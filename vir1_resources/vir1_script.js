// Constants (similar to Python)
const G = 6.67430e-11; // m^3 kg^-1 s^-2
const SOLAR_MASS = 1.989e30; // kg
const KPC = 3.086e19; // meters

// --- Core Physics Calculations ---
function calculateKeplerianVelocity(centralMass, radius) {
    if (radius <= 0) return 0;
    return Math.sqrt((G * centralMass) / radius);
}

function enclosedDarkMassPseudoIsothermal(radiusM, centralDmDensityKgM3, dmCoreRadiusM) {
    if (radiusM <= 0) return 0;
    if (dmCoreRadiusM <= 0) return 0;
    const x = radiusM / dmCoreRadiusM;
    return 4 * Math.PI * centralDmDensityKgM3 * (dmCoreRadiusM ** 3) * (x - Math.atan(x));
}

// --- Simulation Data Generation ---
function getSimulationData() {
    const totalLuminousMassGalaxy = 1e11 * SOLAR_MASS;
    const effectiveCentralMassKepler = totalLuminousMassGalaxy;
    const centralDmDensityKgM3 = 6.77e-22;
    const dmCoreRadiusM = 2 * KPC;

    const radiiKpcValues = [0.1, 0.5, 1, 2, 5, 10, 15, 20, 30, 50, 70, 100];
    const radiiMValues = radiiKpcValues.map(r => r * KPC);

    const results = {
        radiiKpc: [],
        vKeplerKmS: [],
        vTotalModelledKmS: [],
        dmCoreRadiusKpc: dmCoreRadiusM / KPC // For annotation
    };

    radiiMValues.forEach(rM => {
        const rKpc = rM / KPC;
        const vKeplerMS = calculateKeplerianVelocity(effectiveCentralMassKepler, rM);
        results.vKeplerKmS.push(vKeplerMS / 1000);

        // Simplified luminous mass model (concentrated at the center for this example)
        let mLumEnclosedKg;
        if (rKpc < 15) { // Matches the Python example's simplified luminous mass
            mLumEnclosedKg = totalLuminousMassGalaxy * (rKpc / 15); // Linear increase up to 15 kpc
        } else {
            mLumEnclosedKg = totalLuminousMassGalaxy; // Max luminous mass beyond 15 kpc
        }
        // Ensure it doesn't exceed total luminous mass if rKpc/15 > 1 for some reason
        mLumEnclosedKg = Math.min(mLumEnclosedKg, totalLuminousMassGalaxy); 

        const mDarkModelKg = enclosedDarkMassPseudoIsothermal(rM, centralDmDensityKgM3, dmCoreRadiusM);
        const mTotalModelKg = mLumEnclosedKg + mDarkModelKg;
        const vTotalModelledMS = calculateKeplerianVelocity(mTotalModelKg, rM);

        results.radiiKpc.push(rKpc);
        results.vTotalModelledKmS.push(vTotalModelledMS / 1000);
    });
    return results;
}

// --- DOM Elements ---
const screens = {
    start: document.getElementById('start-screen'),
    luminousAnim: document.getElementById('luminous-animation-screen'),
    darkMatterAnim: document.getElementById('dark-matter-animation-screen'),
    simulation: document.getElementById('simulation-screen')
};

const buttons = {
    beginDemostration: document.getElementById('begin-demonstration-btn'),
    skipToGraph: document.querySelectorAll('.skip-to-graph-btn'), // NodeList
    nextToDarkMatterAnim: document.getElementById('next-to-dark-matter-anim-btn'),
    nextToSimulation: document.getElementById('next-to-simulation-btn'),
    closePopup: document.getElementById('close-popup-btn'),
    previousSection: document.getElementById('previous-section-btn'), // Added
    nextSection: document.getElementById('next-section-btn') // Added
};

const canvases = {
    luminous: document.getElementById('luminous-animation-canvas'),
    darkMatter: document.getElementById('dark-matter-animation-canvas'),
    chart: document.getElementById('rotation-curve-chart')
};

const popUp = {
    container: document.getElementById('explanation-popup'),
    title: document.getElementById('popup-title'),
    text: document.getElementById('popup-text')
};

const legendCheckboxes = {
    keplerian: document.getElementById('toggle-keplerian'),
    luminousDm: document.getElementById('toggle-luminous-dm'),
    dmCore: document.getElementById('toggle-dm-core')
};

let chartInstance = null;
let simulationData = null;
let luminousAnimationId = null;
let darkMatterAnimationId = null;
let currentScreenIndex = 0; // To track the current screen
const screenOrder = ['start', 'luminousAnim', 'darkMatterAnim', 'simulation']; // Define screen order

// --- Screen Navigation ---
function showScreen(screenIdOrIndex) {
    // Stop any running animations
    if (luminousAnimationId) cancelAnimationFrame(luminousAnimationId);
    if (darkMatterAnimationId) cancelAnimationFrame(darkMatterAnimationId);

    let targetScreenId;
    if (typeof screenIdOrIndex === 'number') {
        currentScreenIndex = screenIdOrIndex;
        targetScreenId = screenOrder[currentScreenIndex];
    } else {
        currentScreenIndex = screenOrder.indexOf(screenIdOrIndex);
        targetScreenId = screenIdOrIndex;
    }

    Object.values(screens).forEach(screen => screen.style.display = 'none');
    if (screens[targetScreenId]) { // Check if the screen exists
        screens[targetScreenId].style.display = 'block';
    }

    // Update button states
    if (buttons.nextSection) buttons.nextSection.disabled = currentScreenIndex === screenOrder.length - 1;

    if (targetScreenId === 'luminousAnim') {
        initLuminousAnimation();
    } else if (targetScreenId === 'darkMatterAnim') {
        initDarkMatterAnimation();
    } else if (targetScreenId === 'simulation') {
        if (!simulationData) {
            simulationData = getSimulationData();
        }
        renderChart(simulationData);
    }
}

// --- Event Listeners ---
if (buttons.beginDemostration) {
    buttons.beginDemostration.addEventListener('click', () => showScreen('luminousAnim'));
}

buttons.skipToGraph.forEach(btn => btn.addEventListener('click', () => showScreen('simulation')));

if (buttons.nextToDarkMatterAnim) { // Added null check
    buttons.nextToDarkMatterAnim.addEventListener('click', () => showScreen('darkMatterAnim'));
}

if (buttons.nextToSimulation) { // Added null check
    buttons.nextToSimulation.addEventListener('click', () => showScreen('simulation'));
}

if (buttons.closePopup) {
    buttons.closePopup.addEventListener('click', () => popUp.container.style.display = 'none');
}

if (buttons.previousSection) { // Add null check
    buttons.previousSection.addEventListener('click', () => {
        if (currentScreenIndex === 0) {
            window.location.href = 'index.html'; // Navigate to index.html if on the first screen
        } else if (currentScreenIndex > 0) {
            showScreen(currentScreenIndex - 1);
        }
    });
}

if (buttons.nextSection) { // Add null check
    buttons.nextSection.addEventListener('click', () => {
        if (currentScreenIndex < screenOrder.length - 1) {
            showScreen(currentScreenIndex + 1);
        }
    });
}

Object.values(legendCheckboxes).forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        if (chartInstance) renderChart(simulationData); // Re-render chart on legend change
    });
});

// --- Animation Logic (Simplified Placeholder) ---
function setupAnimation(canvas, particleConfigs, keplerianLike) {
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let particles = [];

    particleConfigs.forEach(config => {
        particles.push({
            radius: config.radius,
            angle: config.angle * Math.PI / 180, // Convert to radians
            baseSpeed: config.speedFactor, // Relative speed
            color: config.color,
            x: 0, y: 0
        });
    });

    function drawParticle(p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.fill();
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw central body
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
        ctx.fillStyle = 'yellow';
        ctx.strokeStyle = 'orange';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        particles.forEach(p => {
            // Simplified speed calculation for animation
            let angularSpeed = p.baseSpeed * 0.02; // Base animation speed factor
            if (keplerianLike) {
                // Decrease speed with distance for Keplerian-like motion
                angularSpeed *= (50 / p.radius); // Arbitrary scaling
            }
            p.angle += angularSpeed;
            p.x = centerX + p.radius * Math.cos(p.angle);
            p.y = centerY + p.radius * Math.sin(p.angle);
            drawParticle(p);
        });

        if (canvas.id === canvases.luminous.id) {
            luminousAnimationId = requestAnimationFrame(animate);
        } else if (canvas.id === canvases.darkMatter.id) {
            darkMatterAnimationId = requestAnimationFrame(animate);
        }
    }
    animate(); 
}

function initLuminousAnimation() {
    const particleConfigs = [
        { radius: 50, angle: 0, speedFactor: 1.0, color: 'lightblue' },
        { radius: 100, angle: 90, speedFactor: 1.0, color: 'lightgreen' }, // Adjusted speed for demo
        { radius: 150, angle: 45, speedFactor: 1.0, color: 'lightcoral' },
        { radius: 200, angle: 135, speedFactor: 1.0, color: 'lightgoldenrodyellow' }
    ];
    setupAnimation(canvases.luminous, particleConfigs, true); // true for Keplerian-like speed falloff
}

function initDarkMatterAnimation() {
    const particleConfigs = [
        { radius: 50, angle: 0, speedFactor: 1.0, color: 'lightblue' },
        { radius: 100, angle: 90, speedFactor: 1.0, color: 'lightgreen' },
        { radius: 150, angle: 45, speedFactor: 1.0, color: 'lightcoral' },
        { radius: 200, angle: 135, speedFactor: 1.0, color: 'lightgoldenrodyellow' }
    ];
    setupAnimation(canvases.darkMatter, particleConfigs, false); // false for more uniform speed
}

// --- Charting Logic (using Chart.js - placeholder, needs Chart.js library) ---
function renderChart(data) {
    if (!window.Chart) {
        canvases.chart.getContext('2d').fillText("Chart.js library not loaded. Please include it.", 10, 50);
        console.error("Chart.js not found. Please include the library.");
        return;
    }

    if (chartInstance) {
        chartInstance.destroy();
    }

    const datasets = [];

    if (legendCheckboxes.keplerian.checked) {
        datasets.push({
            label: 'Keplerian (Luminous Only)',
            data: data.vKeplerKmS,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.1,
            pointRadius: 5,
            pointHoverRadius: 8
        });
    }

    if (legendCheckboxes.luminousDm.checked) {
        datasets.push({
            label: 'Luminous + Dark Matter (Observed)',
            data: data.vTotalModelledKmS,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.1,
            pointRadius: 5,
            pointHoverRadius: 8
        });
    }
    
    const annotations = {};
    if (legendCheckboxes.dmCore.checked && data.dmCoreRadiusKpc) {
        annotations.line1 = {
            type: 'line',
            xMin: data.dmCoreRadiusKpc,
            xMax: data.dmCoreRadiusKpc,
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
                content: 'DM Core Radius',
                enabled: true,
                position: 'start',
                backgroundColor: 'rgba(255, 206, 86, 0.7)',
                color: 'black',
                font: { style: 'bold'}
            }
        };
    }

    chartInstance = new Chart(canvases.chart, {
        type: 'line',
        data: {
            labels: data.radiiKpc,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Galaxy Rotation Curves',
                    color: '#e0e0e0',
                    font: { size: 18 }
                },
                legend: {
                    display: false, // Using custom HTML legend
                    labels: { color: '#e0e0e0' }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toFixed(2) + ' km/s';
                            }
                            return label;
                        }
                    },
                },
                annotation: {
                    annotations: annotations
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Radius (kpc)',
                        color: '#c0c0c0'
                    },
                    ticks: { color: '#c0c0c0' },
                    grid: { color: '#444444' }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Velocity (km/s)',
                        color: '#c0c0c0'
                    },
                    ticks: { color: '#c0c0c0' },
                    grid: { color: '#444444' },
                    beginAtZero: true
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const firstPoint = elements[0];
                    const datasetIndex = firstPoint.datasetIndex;
                    const index = firstPoint.index;
                    const datasetLabel = chartInstance.data.datasets[datasetIndex].label;
                    const radius = chartInstance.data.labels[index];
                    const velocity = chartInstance.data.datasets[datasetIndex].data[index];

                    popUp.title.textContent = `Data Point: ${datasetLabel}`;
                    popUp.text.innerHTML = 
                        `At a radius of <strong>${radius.toFixed(2)} kpc</strong>:<br>
                         Velocity is <strong>${velocity.toFixed(2)} km/s</strong>.<br><br>
                         This point represents the rotational speed of galactic matter at this distance from the center, 
                         based on the selected mass model (${datasetLabel.toLowerCase().includes('keplerian') ? 'luminous mass only' : 'luminous and dark matter'}).`;
                    popUp.container.style.display = 'flex';
                }
            }
        }
    });
}

// --- Initial Setup ---
showScreen('start'); // Show start screen initially

// Reminder to include Chart.js and the annotation plugin:
// <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
// <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation@latest/dist/chartjs-plugin-annotation.min.js"></script>
// Make sure these are in your HTML file before script.js
