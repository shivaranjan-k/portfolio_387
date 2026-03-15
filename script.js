console.log("Portfolio script.js loaded successfully!");
// Loading Screen Logic
const initLoader = () => {
    const loader = document.getElementById("loader");
    const mainContent = document.getElementById("main-content");

    if (loader && mainContent) {
        // Simulate loading time
        setTimeout(() => {
            loader.style.opacity = "0";
            loader.style.visibility = "hidden";
            mainContent.classList.add("visible");
        }, 3500);
    }
};

initLoader();

// Outer Space Animation using Three.js
const initSpace = () => {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;

    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Group to hold all universe elements
    const universe = new THREE.Group();
    scene.add(universe);

    // 1. Starfield Particles 
    const particlesCount = 3000;
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);
    const sizesArray = new Float32Array(particlesCount);

    const colors = [
        new THREE.Color(0xffffff), // Pure bright white
        new THREE.Color(0xdcefff), // Light cyan/ice blue
        new THREE.Color(0xffbbff), // Soft glowing pink
        new THREE.Color(0xb3d4ff), // Deeper blue
        new THREE.Color(0xfff7e6)  // Very soft starlight yellow
    ];

    for (let i = 0; i < particlesCount; i++) {
        // Distribute particles in a large volume
        posArray[i * 3] = (Math.random() - 0.5) * 80;     // widen x bounds 
        posArray[i * 3 + 1] = (Math.random() - 0.5) * 80; // widen y bounds 
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 80; // widen z bounds 

        // Pick a random color from palette
        const color = colors[Math.floor(Math.random() * colors.length)];

        // Sometimes dim the star for aesthetic cinematic contrast
        const dimFactor = Math.random() > 0.4 ? Math.random() * 0.4 + 0.3 : 1.0;

        colorsArray[i * 3] = color.r * dimFactor;
        colorsArray[i * 3 + 1] = color.g * dimFactor;
        colorsArray[i * 3 + 2] = color.b * dimFactor;

        // Size variation
        sizesArray[i] = Math.random();
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
    particlesGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizesArray, 1));

    // Custom shader material for glowing stars that twinkle and warp
    const particlesMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            uSpeed: { value: 0.6 } // SLOW, majestic, elegant drift speed
        },
        vertexShader: `
            attribute float aSize;
            varying vec3 vColor;
            varying float vAlpha;
            uniform float uTime;
            uniform float uPixelRatio;
            uniform float uSpeed;

            void main() {
                vColor = color;
                
                vec3 pos = position;
                
                // Infinite, slow, cinematic diagonal drift (top-left to bottom-right)
                float moveAmt = uTime * uSpeed;
                pos.x += moveAmt * 0.7; // Gentle diagonal
                pos.y -= moveAmt;       // Dominant fall
                pos.z += moveAmt * 0.3; // Very subtle forward depth
                
                // Wrap around uniformly in the wider bounds (depth is ~80)
                pos.x = mod(pos.x + 40.0, 80.0) - 40.0;
                pos.y = mod(pos.y + 40.0, 80.0) - 40.0;
                pos.z = mod(pos.z + 40.0, 80.0) - 40.0;

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                
                // Substantially increase base size to make stars much more visible and prominent
                gl_PointSize = (aSize * 150.0 * uPixelRatio) * (1.0 / -mvPosition.z);
                
                // Brighter base alpha for twinkling (never dims completely out)
                vAlpha = 0.6 + 0.4 * sin(uTime * 0.5 + position.x * 50.0 + position.y * 30.0);
                
                // Extremely wide smooth fade on bounds to prevent any sudden popping
                float fadeX = smoothstep(-40.0, -25.0, pos.x) * smoothstep(40.0, 25.0, pos.x);
                float fadeY = smoothstep(-40.0, -25.0, pos.y) * smoothstep(40.0, 25.0, pos.y);
                float fadeZ = smoothstep(-40.0, -25.0, pos.z) * smoothstep(40.0, 25.0, pos.z);
                
                vAlpha *= fadeX * fadeY * fadeZ;

                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                // Circular soft particle
                float dist = distance(gl_PointCoord, vec2(0.5));
                if (dist > 0.5) discard;
                
                // Crisp, extremely sharp glowing star center with a smooth outer halo
                // Power raised slightly to create a wider, brighter core
                float alpha = smoothstep(0.5, 0.05, dist);
                alpha = pow(alpha, 1.0); 
                
                // Boost final brightness
                gl_FragColor = vec4(vColor, alpha * vAlpha * 1.5);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true
    });

    const starMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    universe.add(starMesh);


    // 3. Milky Wave (Ambient Nebula Band)
    const nebulaGeometry = new THREE.BufferGeometry();
    const nebulaCount = 120; // Dense cloud
    const nebPosArray = new Float32Array(nebulaCount * 3);
    const nebColorsArray = new Float32Array(nebulaCount * 3);

    const milkyWayColors = [
        new THREE.Color(0x0e0638), // Ultra-deep midnight blue 
        new THREE.Color(0x321359), // Deep royal purple
        new THREE.Color(0x6a1a78), // Rich violet
        new THREE.Color(0x9a2285), // Magenta/synth pink
        new THREE.Color(0x0f3869)  // Deep oceanic cyan/blue
    ];

    for (let i = 0; i < nebulaCount; i++) {
        // Create an aesthetic diagonal band from bottom-left to top-right
        const pathT = (Math.random() - 0.5) * 80;

        // Concentrate points closer to the center of the band loosely, yielding a tighter, brighter swathe
        const spreadRand = (Math.random() - 0.5) * (Math.random() - 0.5) * 20;

        nebPosArray[i * 3] = pathT + spreadRand;     // x
        nebPosArray[i * 3 + 1] = pathT * 0.6 + spreadRand; // y (diagonal slope, slightly shallower)
        nebPosArray[i * 3 + 2] = (Math.random() - 0.5) * 20 - 15; // z

        const color = milkyWayColors[Math.floor(Math.random() * milkyWayColors.length)];

        nebColorsArray[i * 3] = color.r;
        nebColorsArray[i * 3 + 1] = color.g;
        nebColorsArray[i * 3 + 2] = color.b;
    }
    nebulaGeometry.setAttribute('position', new THREE.BufferAttribute(nebPosArray, 3));
    nebulaGeometry.setAttribute('color', new THREE.BufferAttribute(nebColorsArray, 3));

    const nebulaMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
        },
        vertexShader: `
            varying vec3 vColor;
            uniform float uTime;
            uniform float uPixelRatio;

            void main() {
                vColor = color;
                vec3 pos = position;
                
                // Ultra-slow floating and pulsating for the nebula
                pos.x += sin(uTime * 0.1 + pos.y) * 2.0;
                pos.y += cos(uTime * 0.08 + pos.x) * 2.0;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                // Make the clouds vast and seamless
                gl_PointSize = 1000.0 * uPixelRatio * (1.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;

            void main() {
                float dist = distance(gl_PointCoord, vec2(0.5));
                if (dist > 0.5) discard;
                
                // Extremely soft edges blending
                float alpha = pow(1.0 - (dist * 2.0), 3.0);
                
                // Rich but transparent blending
                gl_FragColor = vec4(vColor, alpha * 0.2); 
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true
    });

    const nebulaMesh = new THREE.Points(nebulaGeometry, nebulaMaterial);
    universe.add(nebulaMesh);


    // Animation Loop
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) * 0.0005; // very delicate sensitivity
        mouseY = (event.clientY - windowHalfY) * 0.0005;
    });

    // Aesthetic Shooting Stars Spawner
    function spawnShootingStar() {
        // Prevent spawning if the user is scrolling rapidly or page is out of focus for performance
        if (document.hidden) {
            setTimeout(spawnShootingStar, 2000);
            return;
        }

        const star = document.createElement('div');
        star.classList.add('shooting-star');

        // Randomize starting location (mostly top/left to keep the diagonal flow)
        const startY = Math.random() * (window.innerHeight * 0.4);
        const startX = Math.random() * window.innerWidth;

        star.style.top = `${startY}px`;
        star.style.left = `${startX}px`;

        // Randomize size slightly for depth
        const scale = 0.5 + Math.random() * 0.7;
        star.style.transform = `scale(${scale})`;

        document.body.appendChild(star);

        // Remove star after animation completes (4s + buffer)
        setTimeout(() => {
            star.remove();
        }, 4500);

        // Randomize next spawn time (between 2s and 6s)
        const nextSpawn = 2000 + Math.random() * 4000;
        setTimeout(spawnShootingStar, nextSpawn);
    }

    // Start shooting star loop
    setTimeout(spawnShootingStar, 3000);

    const aestheticMoon = document.querySelector('.aesthetic-moon');

    if (aestheticMoon) {
        // Moon Click Effect
        aestheticMoon.addEventListener('click', () => {
            aestheticMoon.classList.remove('clicked');
            void aestheticMoon.offsetWidth; // Trigger reflow to restart animation
            aestheticMoon.classList.add('clicked');
        });
    }

    let scrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;

        // Moon Parallax Scroll Effect
        if (aestheticMoon) {
            // Apply parallax translateY and slight rotation
            const yMove = scrollY * 0.4;
            const rotate = scrollY * 0.05;

            // Fade out moon when scrolling down (e.g., completely faded by 400px scroll)
            const fadeEnd = 400;
            let currentOpacity = 0.95; // Default max opacity

            if (scrollY > 0) {
                currentOpacity = Math.max(0, 0.95 - (scrollY / fadeEnd) * 0.95);
            }
            aestheticMoon.style.opacity = currentOpacity;

            // Setting custom properties so the CSS keyframes can inherit them instead of overwriting
            aestheticMoon.style.setProperty('--parallax-y', `${yMove}px`);
            aestheticMoon.style.setProperty('--parallax-r', `${rotate}deg`);

            // Only apply transform via JS if it's not currently animating a click
            if (!aestheticMoon.classList.contains('clicked')) {
                aestheticMoon.style.transform = `translateY(${yMove}px) rotate(${rotate}deg)`;
            }
        }
    });

    const clock = new THREE.Clock();

    const tick = () => {
        const elapsedTime = clock.getElapsedTime();

        if (particlesMaterial.uniforms) particlesMaterial.uniforms.uTime.value = elapsedTime;
        if (nebulaMaterial.uniforms) nebulaMaterial.uniforms.uTime.value = elapsedTime;



        targetX += (mouseX - targetX) * 0.01; // Slower interpolation for cinematic feel
        targetY += (mouseY - targetY) * 0.01;

        universe.rotation.y = elapsedTime * 0.01; // Slower world rotation
        universe.rotation.z = elapsedTime * 0.005;
        universe.rotation.x = elapsedTime * 0.002;

        universe.position.x = -targetX * 8; // Less aggressive shift
        universe.position.y = targetY * 8;

        camera.position.y += (-scrollY * 0.003 - camera.position.y) * 0.03; // Buttery scroll effect

        camera.lookAt(scene.position);

        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    }

    tick();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        const newPixelRatio = Math.min(window.devicePixelRatio, 2);
        renderer.setPixelRatio(newPixelRatio);
        if (particlesMaterial.uniforms) particlesMaterial.uniforms.uPixelRatio.value = newPixelRatio;
        if (nebulaMaterial.uniforms) nebulaMaterial.uniforms.uPixelRatio.value = newPixelRatio;
    });
};

initSpace();


// -------------------------------------------------------------------------- //
// Dynamic Content Rendering & Management
// -------------------------------------------------------------------------- //

document.addEventListener('DOMContentLoaded', () => {

    // --- Data Initialization ---
    // Try to load from local storage first, fallback to data.js defaults if empty
    const savedData = localStorage.getItem('portfolioData');
    if (savedData) {
        try {
            window.portfolioData = JSON.parse(savedData);
        } catch (e) {
            console.error("Could not parse saved portfolio data", e);
        }
    }

    // Helper to save data
    const saveData = () => {
        localStorage.setItem('portfolioData', JSON.stringify(window.portfolioData));
    };

    // DOM Elements
    const skillsContainer = document.getElementById('skills-container');
    const projectsContainer = document.getElementById('projects-container');

    const skillModal = document.getElementById('skill-modal');
    const projectModal = document.getElementById('project-modal');

    // --- Render Functions ---

    const renderSkills = () => {
        if (!skillsContainer || !window.portfolioData) return;
        skillsContainer.innerHTML = ''; // Clear current

        window.portfolioData.skills.forEach((skill, index) => {
            const skillCard = document.createElement('div');
            skillCard.className = 'skill-card';
            skillCard.innerHTML = `
                <button class="edit-btn" data-index="${index}" title="Edit Skill">&#9998;</button>
                <h3>${skill.name}</h3>
                <div class="progress">
                    <div class="progress-bar" style="width: ${skill.progress}%;"></div>
                </div>
            `;
            skillsContainer.appendChild(skillCard);
        });

        // Add event listeners for edit buttons
        const editBtns = skillsContainer.querySelectorAll('.edit-btn');
        editBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                const skill = window.portfolioData.skills[index];

                // Populate modal
                document.getElementById('update-skill-index').value = index;
                document.getElementById('update-skill-name').value = skill.name;
                document.getElementById('update-skill-progress').value = skill.progress;

                // Open modal
                const updateSkillModal = document.getElementById('update-skill-modal');
                if (updateSkillModal) updateSkillModal.classList.add('active');
            });
        });

        // Add the "+" card
        const addSkillCard = document.createElement('div');
        addSkillCard.className = 'add-card';
        addSkillCard.innerHTML = `
            <div class="add-icon">+</div>
            <div class="add-text">Add Skill</div>
        `;
        addSkillCard.addEventListener('click', () => {
            if (skillModal) skillModal.classList.add('active');
        });
        skillsContainer.appendChild(addSkillCard);
    };

    const renderProjects = () => {
        if (!projectsContainer || !window.portfolioData) return;
        projectsContainer.innerHTML = ''; // Clear current

        window.portfolioData.projects.forEach((project, index) => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';

            const tagsHTML = project.tags.map(tag => `<span>${tag.trim()}</span>`).join('');

            const linksHTML = project.links.map(link => {
                const btnClass = link.type === 'outline' ? 'project-btn outline' : 'project-btn';
                return `<a href="${link.url}" class="${btnClass}">${link.label}</a>`;
            }).join('');

            projectCard.innerHTML = `
                <div class="project-image ${project.imageClass}">
                    <button class="edit-btn" data-index="${index}" title="Edit Project">&#9998;</button>
                    ${project.imageText}
                </div>
                <div class="project-info">
                    <div class="project-tags">
                        ${tagsHTML}
                    </div>
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="project-links">
                        ${linksHTML}
                    </div>
                </div>
            `;
            projectsContainer.appendChild(projectCard);
        });

        // Add event listeners for edit buttons
        const editBtns = projectsContainer.querySelectorAll('.edit-btn');
        editBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                const project = window.portfolioData.projects[index];

                // Populate modal
                document.getElementById('update-project-index').value = index;
                document.getElementById('update-project-title').value = project.title;
                document.getElementById('update-project-desc').value = project.description;
                document.getElementById('update-project-img-text').value = project.imageText;
                document.getElementById('update-project-tags').value = project.tags.join(', ');

                // Assuming first link is live demo for simplicity in this iteration
                document.getElementById('update-project-link').value = project.links.length > 0 ? project.links[0].url : '#';

                // Open modal
                const updateProjectModal = document.getElementById('update-project-modal');
                if (updateProjectModal) updateProjectModal.classList.add('active');
            });
        });

        // Add the "+" card
        const addProjectCard = document.createElement('div');
        addProjectCard.className = 'add-card';
        addProjectCard.innerHTML = `
            <div class="add-icon">+</div>
            <div class="add-text">Add Project</div>
        `;
        addProjectCard.addEventListener('click', () => {
            if (projectModal) projectModal.classList.add('active');
        });
        projectsContainer.appendChild(addProjectCard);
    };

    // --- Initial Render ---
    renderSkills();
    renderProjects();

    // --- Modal Management ---

    // Close functions
    document.getElementById('close-skill-modal')?.addEventListener('click', () => {
        skillModal.classList.remove('active');
    });

    document.getElementById('close-update-skill-modal')?.addEventListener('click', () => {
        const updateSkillModal = document.getElementById('update-skill-modal');
        if (updateSkillModal) updateSkillModal.classList.remove('active');
    });

    document.getElementById('close-project-modal')?.addEventListener('click', () => {
        projectModal.classList.remove('active');
    });

    document.getElementById('close-update-project-modal')?.addEventListener('click', () => {
        const updateProjectModal = document.getElementById('update-project-modal');
        if (updateProjectModal) updateProjectModal.classList.remove('active');
    });

    // Close on background click
    window.addEventListener('click', (e) => {
        const updateSkillModal = document.getElementById('update-skill-modal');
        const updateProjectModal = document.getElementById('update-project-modal');
        if (e.target === skillModal) skillModal.classList.remove('active');
        if (updateSkillModal && e.target === updateSkillModal) updateSkillModal.classList.remove('active');
        if (e.target === projectModal) projectModal.classList.remove('active');
        if (updateProjectModal && e.target === updateProjectModal) updateProjectModal.classList.remove('active');
    });

    // --- Form Submissions ---

    const addSkillForm = document.getElementById('add-skill-form');
    if (addSkillForm) {
        addSkillForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('skill-name').value;
            const progress = document.getElementById('skill-progress').value;

            // Add to data state
            window.portfolioData.skills.push({ name, progress: parseInt(progress) });
            saveData();

            // Re-render UI
            renderSkills();

            // Clean up
            addSkillForm.reset();
            skillModal.classList.remove('active');
        });
    }

    const updateSkillForm = document.getElementById('update-skill-form');
    if (updateSkillForm) {
        updateSkillForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const index = parseInt(document.getElementById('update-skill-index').value, 10);
            const name = document.getElementById('update-skill-name').value;
            const progress = document.getElementById('update-skill-progress').value;

            // Update data state
            window.portfolioData.skills[index] = { name, progress: parseInt(progress, 10) };
            saveData();

            // Re-render UI
            renderSkills();

            // Clean up
            const updateSkillModal = document.getElementById('update-skill-modal');
            if (updateSkillModal) updateSkillModal.classList.remove('active');
        });

        // Delete Skill Logic
        const deleteSkillBtn = document.getElementById('delete-skill-btn');
        if (deleteSkillBtn) {
            deleteSkillBtn.addEventListener('click', () => {
                const index = parseInt(document.getElementById('update-skill-index').value, 10);
                if (confirm('Are you sure you want to delete this skill?')) {
                    window.portfolioData.skills.splice(index, 1);
                    saveData();
                    renderSkills();
                    const updateSkillModal = document.getElementById('update-skill-modal');
                    if (updateSkillModal) updateSkillModal.classList.remove('active');
                }
            });
        }
    }

    const addProjectForm = document.getElementById('add-project-form');
    if (addProjectForm) {
        addProjectForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const newProject = {
                title: document.getElementById('project-title').value,
                description: document.getElementById('project-desc').value,
                imageText: document.getElementById('project-img-text').value,
                imageClass: '', // Keep simple for now
                tags: document.getElementById('project-tags').value.split(',').map(tag => tag.trim()).filter(Boolean),
                links: [
                    { label: "Live Demo", url: document.getElementById('project-link').value, type: "primary" }
                ]
            };

            // Add to data state
            window.portfolioData.projects.push(newProject);
            saveData();

            // Re-render UI
            renderProjects();

            // Clean up
            addProjectForm.reset();
            projectModal.classList.remove('active');
        });
    }

    const updateProjectForm = document.getElementById('update-project-form');
    if (updateProjectForm) {
        updateProjectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const index = parseInt(document.getElementById('update-project-index').value, 10);

            const updatedProject = {
                title: document.getElementById('update-project-title').value,
                description: document.getElementById('update-project-desc').value,
                imageText: document.getElementById('update-project-img-text').value,
                imageClass: window.portfolioData.projects[index].imageClass || '', // Preserve image class
                tags: document.getElementById('update-project-tags').value.split(',').map(tag => tag.trim()).filter(Boolean),
                links: [
                    { label: "Live Demo", url: document.getElementById('update-project-link').value, type: "primary" }
                ]
            };

            // Update data state
            window.portfolioData.projects[index] = updatedProject;
            saveData();

            // Re-render UI
            renderProjects();

            // Clean up
            const updateProjectModal = document.getElementById('update-project-modal');
            if (updateProjectModal) updateProjectModal.classList.remove('active');
        });

        // Delete Project Logic
        const deleteProjectBtn = document.getElementById('delete-project-btn');
        if (deleteProjectBtn) {
            deleteProjectBtn.addEventListener('click', () => {
                const index = parseInt(document.getElementById('update-project-index').value, 10);
                if (confirm('Are you sure you want to delete this project?')) {
                    window.portfolioData.projects.splice(index, 1);
                    saveData();
                    renderProjects();
                    const updateProjectModal = document.getElementById('update-project-modal');
                    if (updateProjectModal) updateProjectModal.classList.remove('active');
                }
            });
        }
    }
});
