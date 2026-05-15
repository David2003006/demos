
const AppState = {
    user: {
        id: "",
        name: "",
        matriz: "",
        role: ""
    },
    contentToRender: "ResumeBoard",
    
    setUser(newUser) {
        console.log("Cambiando usuario de Estado:", newUser);
        this.user = newUser;
        renderApp();
    },
    setContent(contentKey) {
        console.log("Cambiando contenido a:", contentKey);
        this.contentToRender = contentKey;
        renderMainContent();
    }
};

const menuOptions = [
    { label: "Resumen", key: "ResumeBoard" },
    { label: "Cotizar", key: "QuotesBoard" },
    { label: "Generar guias", key: "LabelsBoard" },
    { label: "Guias generadas", key: "LabelsTable" },
    { label: "Administrar usuarios", key: "UsersLayout" },
    { label: "Cerrar sesión", key: "logout", isAction: true }
];

const menuClientOptions = [
    { label: "Resumen", key: "ResumeBoard" },
    { label: "Cotizar", key: "QuotesBoard" },
    { label: "Generar guias", key: "LabelsBoard" },
    { label: "Guias generadas", key: "LabelsTable" },
    { label: "Cerrar sesión", key: "logout", isAction: true }
];

function renderApp() {
    console.log("Ejecutando renderApp()...");
    const root = document.getElementById('app-root');
    
    if (!root) {
        console.error("CRÍTICO: No se encontró el contenedor '#app-root' en el DOM.");
        return;
    }
    
    root.innerHTML = ''; 

    if (AppState.user.id === "") {
        console.log("Renderizando pantalla de Login...");
        const template = document.getElementById('template-login');
        if (!template) {
            console.error("CRÍTICO: No se encontró el <template id='template-login'> en el HTML.");
            return;
        }
        
        const clone = template.content.cloneNode(true);
        
        const btnAdmin = clone.getElementById('btn-mock-login');
        const btnClient = clone.getElementById('btn-mock-client');
        
        if (btnAdmin) {
            btnAdmin.addEventListener('click', () => {
                AppState.setUser({ id: "usr-001", name: "David Alejandro", matriz: "Principal", role: "admin" });
            });
        }
        if (btnClient) {
            btnClient.addEventListener('click', () => {
                AppState.setUser({ id: "usr-002", name: "Cliente Beta", matriz: "Sucursal A", role: "client" });
            });
        }

        root.appendChild(clone);
    } 
    else {
        console.log("Renderizando Dashboard principal...");
        const template = document.getElementById('template-dashboard');
        if (!template) {
            console.error("CRÍTICO: No se encontró el <template id='template-dashboard'> en el HTML.");
            return;
        }
        
        const clone = template.content.cloneNode(true);
        
        const badge = clone.getElementById('user-display-name');
        if (badge) badge.textContent = `${AppState.user.name} (${AppState.user.role})`;
        
        const menuList = clone.getElementById('menu-options-list');
        if (menuList) {
            const activeMenu = AppState.user.role === 'admin' ? menuOptions : menuClientOptions;
            
            activeMenu.forEach(option => {
                const li = document.createElement('li');
                const button = document.createElement('button');
                button.textContent = option.label;
                
                if (option.isAction) {
                    button.classList.add('btn-logout');
                    button.addEventListener('click', () => {
                        AppState.setUser({ id: "", name: "", matriz: "", role: "" });
                        AppState.setContent("ResumeBoard");
                    });
                } else {
                    if (AppState.contentToRender === option.key) li.classList.add('active');
                    button.addEventListener('click', () => AppState.setContent(option.key));
                }
                
                li.appendChild(button);
                menuList.appendChild(li);
            });
        }

        root.appendChild(clone);
        renderMainContent(); 
    }
    
    if (window.lucide) window.lucide.createIcons();
}

async function renderMainContent() {
    const container = document.getElementById('dynamic-content-wrapper');
    if (!container) return;

    
    if (AppState.contentToRender === "ResumeBoard") {
        container.innerHTML = `<div class="kpi-card"><p>Cargando panel de resumen...</p></div>`;
        try {
            const response = await fetch('../html/resumen.html');
            if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
            const htmlText = await response.text();
            container.innerHTML = htmlText;
        } catch (error) {
            console.error("Error en el fetch de resumen:", error);
            container.innerHTML = `<div class="kpi-card"><h2>Error</h2><p>No se pudo leer ../html/resumen.html</p></div>`;
        }
    } 
    
    else if (AppState.contentToRender === "QuotesBoard") {
        container.innerHTML = `<div class="glass-card"><p>Cargando módulo de cotizaciones...</p></div>`;
        try {
            const response = await fetch('../html/cotizar.html');
            if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
            const htmlText = await response.text();
            container.innerHTML = htmlText;

            const checkbox = document.getElementById('includeInsurance');
            const insuranceWrapper = document.getElementById('insurance-input-wrapper');
            if (checkbox && insuranceWrapper) {
                checkbox.addEventListener('change', (e) => {
                    insuranceWrapper.classList.toggle('hidden', !e.target.checked);
                });
            }
        } catch (error) {
            console.error("Error en el fetch de cotizar:", error);
            container.innerHTML = `<div class="glass-card"><h2>Error</h2><p>No se pudo leer ../html/cotizar.html</p></div>`;
        }
    } 
    
    else if (AppState.contentToRender === "LabelsBoard") {
        container.innerHTML = `<div class="glass-card"><p>Cargando módulo de guías...</p></div>`;
        try {
            const response = await fetch('../html/generar_guias.html');
            if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
            const htmlText = await response.text();
            container.innerHTML = htmlText;

            const form = document.getElementById('guides-form');
            const modal = document.getElementById('label-success-modal');
            const closeX = document.getElementById('close-modal-x');
            const carrierSelect = document.getElementById('carrier-select');
            const badge = document.getElementById('carrier-modal-badge');

            if (form && modal) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    if (badge && carrierSelect) badge.textContent = `Carrier: ${carrierSelect.value}`;
                    modal.showModal();
                });
            }
            if (closeX && modal) closeX.addEventListener('click', () => modal.close());
        } catch (error) {
            console.error("Error en el fetch de guías:", error);
            container.innerHTML = `<div class="glass-card"><h2>Error</h2><p>No se pudo leer ../html/generar_guias.html</p></div>`;
        }
    }
    
    else if (AppState.contentToRender === "LabelsTable") {
        container.innerHTML = `<div class="glass-card"><p>Cargando historial de guías...</p></div>`;
        try {
            const response = await fetch('../html/guias_generadas.html');
            if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
            const htmlText = await response.text();
            container.innerHTML = htmlText;
        } catch (error) {
            console.error("Error en el fetch de historial:", error);
            container.innerHTML = `<div class="glass-card"><h2>Error</h2><p>No se pudo leer ../html/guias_generadas.html</p></div>`;
        }
    }

    else if (AppState.contentToRender === "UsersLayout") {
        container.innerHTML = `<div class="glass-card"><p>Iniciando panel de administración...</p></div>`;
        try {
            console.log("Solicitando archivo externo desde: ../html/administrar_usuarios.html");
            const response = await fetch('../html/administrar_usuarios.html');
            if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
            const htmlText = await response.text();
            container.innerHTML = htmlText;

            const btnToggle = document.getElementById('btn-toggle-user-form');
            const btnClose = document.getElementById('btn-close-form');
            const btnCancel = document.getElementById('btn-cancel-user');
            const formSection = document.getElementById('user-form-section');

            const toggleForm = () => {
                if(formSection) formSection.classList.toggle('hidden');
            };

            if (btnToggle) btnToggle.addEventListener('click', toggleForm);
            if (btnClose) btnClose.addEventListener('click', toggleForm);
            if (btnCancel) btnCancel.addEventListener('click', toggleForm);
            console.log("Archivo administrar_usuarios.html renderizado con éxito.");
        } catch (error) {
            console.error("Error en el fetch de usuarios:", error);
            container.innerHTML = `<div class="glass-card"><h2 style="color: #e53e3e;">Error</h2><p>No se pudo leer ../html/administrar_usuarios.html</p></div>`;
        }
    }
    else {
        container.innerHTML = `<div class="kpi-card"><h2>404</h2><p>Sección no encontrada.</p></div>`;
    }
    
    if (window.lucide) window.lucide.createIcons();
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM cargado completamente. Iniciando App...");
    renderApp();
});
