document.addEventListener('contextmenu', function(e) {
    e.preventDefault();

    let dialog = document.querySelector('dialog[popup]');
    if (!dialog) {
        dialog = document.createElement('dialog');
        dialog.setAttribute('popup', '');
        dialog.innerHTML = `
            <h1>Implementing settings...</h1>
            <p>Feature not available</p>
            <button onclick="this.closest('dialog').close()">close</button>
        `;
        document.querySelector('div[os-interface]').appendChild(dialog);
    }

    dialog.showModal();
}, false);
const commands = {
    help: () => 'Available commands: help, echo, date, clear, about, whoami, changename, divinfo, crash',
    echo: (args) => args.join(' '),
    date: () => new Date().toString(),
    divinfo: (args) => {
        const [selector, mode] = args; // <-- split args manually
        
        if (mode === 'textcon') {
            return document.querySelector(selector)?.innerHTML || "Nothing found.";
        }
        
        if (mode === 'items') {
            const items = document.querySelector(selector)?.querySelectorAll('*');
            if (!items) return "Selector not found.";
            
            let result = "";
            for (let i = 0; i < items.length && i <= 2048; i++) {
                result += `<p style="color:white; background-color: black; padding: 5px; border-radius: 10px;">` + "Classname: " + items[i].className + " Tag Name:  " + items[i].tagName + '</p> <br>';
            }
            var allItems = () => {
                createWindow('Items', `${result}`)
            };
            allItems();
        }               
    },
    clear: () => { terminalOutput.innerHTML = ''; return ''; },
    about: () => 'Square OS Terminal v1.0',
    whoami: () => `${localStorage.getItem('user')}`,
    changename: (user) => {
        localStorage.setItem('user', user);
        document.querySelector('#use').innerHTML = user;
        return `Username changed to ${user}`;
        
    },
    crash: () => {
        
        setInterval(() => {
            i = document.querySelectorAll('*').length ;
            i--
            document.querySelectorAll('*')[i].remove()
        }, 512)
    }
};
document.addEventListener('DOMContentLoaded', () => {
    createWindow('Release notes', `<div release>
        <p>
        # v1.1<br>
        * New toolbar ui<br>
        * New username loginpage<br>
        * New window design<br>
        * New developer command *divinfo* added<br>
        </p>
    </div>`)
    // After it's inserted, wire up Firebase + chat logic scoped to that window
    function openChatApp() {
        createWindow('Square Chat', `
          <div style="display:flex; flex-direction:column; height:100%;">
            <div id="chat-box" style="flex:1; overflow-y:auto; margin-bottom:8px;"></div>
            <div style="display:flex; gap:6px;">
              <input id="chat-input" type="text" placeholder="Type a message..." style="flex:1; padding:6px; border-radius:6px; border:1px solid #444; background:#282828; color:#fff;" />
              <button id="send-btn" style="padding:6px 12px; border:none; border-radius:6px; background:#00bcd4; color:#fff; cursor:pointer;">Send</button>
            </div>
          </div>
        `);
      
        setTimeout(() => {
          const newWin = document.querySelector('div[window]:last-child');
          const chatBox = newWin.querySelector('#chat-box');
          const input = newWin.querySelector('#chat-input');
          const sendBtn = newWin.querySelector('#send-btn');
          if (!chatBox || !input || !sendBtn) return;
      
          const firebaseConfig = {
            apiKey: "AIzaSyCPvjIGxy4NoeYNG4rR41DEjmmOAfV5ZhA",
            authDomain: "sqchat-27a5c.firebaseapp.com",
            projectId: "sqchat-27a5c",
            storageBucket: "sqchat-27a5c.appspot.com",
            messagingSenderId: "484644576966",
            appId: "1:484644576966:web:429ec000d8c665d57381c7",
            databaseURL: "https://sqchat-27a5c-default-rtdb.firebaseio.com"
          };
          if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
          }
          const db = firebase.database();
          input.addEventListener("keydown", e => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendBtn.click();
            }
          });
          
          // avoid duplicate listeners if reopened
          db.ref("messages").off();
      
          function postMessage() {
            const text = input.value.trim();
            if (!text) return;
            db.ref("messages").push({
              text,
              time: Date.now(),
              user: localStorage.getItem('user') || 'Anon'
            });
            input.value = '';
          }
      
          sendBtn.addEventListener('click', postMessage);
          input.addEventListener('keydown', (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              postMessage();
            }
          });
      
          // Listen for new messages
          db.ref("messages").limitToLast(100).on("child_added", snapshot => {
            const msg = snapshot.val();
            const msgEl = document.createElement('div');
            msgEl.className = 'chat-msg';
            msgEl.style.marginBottom = '6px';
            msgEl.innerHTML = `<strong>${escapeHTML(msg.user || 'Anon')}:</strong> ${escapeHTML(msg.text)}`;
            chatBox.appendChild(msgEl);
            chatBox.scrollTop = chatBox.scrollHeight;
          });
        }, 0);
      }
      
    document.getElementById('chat-launch')?.addEventListener('click', openChatApp);

    localStorage.setItem('user', `user${Math.floor(Math.random() * 20) + 1}`)
    const startMenuBtn = document.querySelector('button[open-startmenu]');
    const startMenu = document.querySelector('div[startmenu]');
    const username = localStorage.getItem('user');
    document.querySelector('#use').innerHTML = username;
    // Start menu functionality
    startMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startMenu.classList.toggle('hidden');
    });

    // Fullscreen toggle button functionality
    document.getElementById('fullscreen-toggle')?.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    // Close start menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!startMenu.classList.contains('hidden') && !startMenu.contains(e.target) && e.target !== startMenuBtn) {
            startMenu.classList.add('hidden');
        }
    });

    // Initialize window functionality for all existing windows
    initializeWindows();

    // Start menu button functionality
    document.getElementById('calc')?.addEventListener('click', () => {
        createWindow('Calculator', 'Calculator content here...');
    });

    document.getElementById('notepad')?.addEventListener('click', () => {
        createWindow('Notepad', '<button save-file>Save</button><input filename placeholder="Filename"></input><textarea placeholder="Start typing here..." style="width: 98%; height: 98%;"></textarea>');
        // Wait for the window to be added to the DOM
        setTimeout(() => {
            const osInterface = document.querySelector('div[os-interface]');
            const lastWindow = osInterface.querySelector('div[window]:last-child');
            if (!lastWindow) return;
            const saveBtn = lastWindow.querySelector('button[save-file]');
            const filenameInput = lastWindow.querySelector('input[filename]');
            const textarea = lastWindow.querySelector('textarea');
            if (saveBtn && filenameInput && textarea) {
                saveBtn.addEventListener('click', () => {
                    const filename = filenameInput.value.trim() || 'untitled.txt';
                    const content = textarea.value;
                    const blob = new Blob([content], { type: 'text/plain' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(a.href);
                    }, 100);
                });
            }
        }, 0);
    });

    document.getElementById('text-editor')?.addEventListener('click', () => {
        createWindow('Text Editor', 'Advanced text editing...');
    });

    document.getElementById('terminal')?.addEventListener('click', () => {
        createWindow('Terminal', `
            <div class="terminal-container" style="background:black;color:lime;font-family:monospace;height:100%;width:100%;padding:0;display:flex;flex-direction:column;">
                <div class="terminal-output" style="flex:1;overflow:auto;padding:10px;"></div>
                <form class="terminal-form" style="display:flex;" onsubmit="return false;">
                    <span style="color:lime;">$</span>
                    <input class="terminal-input" autocomplete="off" style="flex:1;background:black;color:lime;border:none;outline:none;font-family:monospace;font-size:1em;padding:5px;" />
                </form>
            </div>
        `);

        // Wait for the window to be added to the DOM
        setTimeout(() => {
            const osInterface = document.querySelector('div[os-interface]');
            const lastWindow = osInterface.querySelector('div[window]:last-child');
            if (!lastWindow) return;
            const terminalOutput = lastWindow.querySelector('.terminal-output');
            const terminalForm = lastWindow.querySelector('.terminal-form');
            const terminalInput = lastWindow.querySelector('.terminal-input');

            if (!terminalForm) {
                console.error('Terminal form not found!');
                return;
            }

            // Prevent default form submission (backup)
            terminalForm.onsubmit = (e) => e.preventDefault();

            // Focus input on open
            terminalInput.focus();

            // Simple shell commands
            
            
            // Extracted command runner for reuse
            function runTerminalCommand() {
                const input = terminalInput.value.trim();
                if (!input) return;
                terminalOutput.innerHTML += `<div><span style="color:lime;">$</span> ${escapeHTML(input)}</div>`;
                const [cmd, ...args] = input.split(' ');
                let result = '';
                if (commands[cmd]) {
                    result = commands[cmd](args);
                } else {
                    result = `Command not found: ${cmd}`;
                }
                if (result) {
                    terminalOutput.innerHTML += `<div>${escapeHTML(result)}</div>`;
                }
                terminalInput.value = '';
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
            }

            // Listen for form submit
            terminalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                runTerminalCommand();
            });

            // Listen for Enter key on input
            terminalInput.addEventListener('keydown', (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    runTerminalCommand();
                }
            });
        }, 0);
    });

    document.getElementById('paint')?.addEventListener('click', () => {
        createWindow('Paint', `
            <canvas id="paint-canvas" width="380" height="220" style="border:1px solid #000; background:white; cursor:crosshair;"></canvas>
            <div>
                <button id="clear-canvas">Clear</button>
            </div>
        `);
        setTimeout(() => {
            const osInterface = document.querySelector('div[os-interface]');
            const lastWindow = osInterface.querySelector('div[window]:last-child');
            if (!lastWindow) return;
            const canvas = lastWindow.querySelector('#paint-canvas');
            const ctx = canvas.getContext('2d');
            let drawing = false;
            canvas.addEventListener('mousedown', () => drawing = true);
            canvas.addEventListener('mouseup', () => drawing = false);
            canvas.addEventListener('mouseleave', () => drawing = false);
            canvas.addEventListener('mousemove', (e) => {
                if (!drawing) return;
                const rect = canvas.getBoundingClientRect();
                ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
            });
            lastWindow.querySelector('#clear-canvas').addEventListener('click', () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            });
        }, 0);
    });

    document.getElementById('explorer')?.addEventListener('click', () => {
        createWindow('File Explorer', `
            <div style="padding:10px;">
                <p>This is a mock file explorer. (No real file system access in browser)</p>
                <ul>
                    <li>Documents</li>
                    <li>Pictures</li>
                    <li>Music</li>
                    <li>Videos</li>
                </ul>
            </div>
        `);
    });
        // Start menu button functionality
        document.getElementById('calc2')?.addEventListener('click', () => {
            createWindow('Calculator', 'Calculator content here...');
        });
    
        document.getElementById('notepad2')?.addEventListener('click', () => {
            createWindow('Notepad', '<button save-file>Save</button><input filename placeholder="Filename"></input><textarea placeholder="Start typing here..." style="width: 98%; height: 98%;"></textarea>');
            // Wait for the window to be added to the DOM
            setTimeout(() => {
                const osInterface = document.querySelector('div[os-interface]');
                const lastWindow = osInterface.querySelector('div[window]:last-child');
                if (!lastWindow) return;
                const saveBtn = lastWindow.querySelector('button[save-file]');
                const filenameInput = lastWindow.querySelector('input[filename]');
                const textarea = lastWindow.querySelector('textarea');
                if (saveBtn && filenameInput && textarea) {
                    saveBtn.addEventListener('click', () => {
                        const filename = filenameInput.value.trim() || 'untitled.txt';
                        const content = textarea.value;
                        const blob = new Blob([content], { type: 'text/plain' });
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(blob);
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        setTimeout(() => {
                            document.body.removeChild(a);
                            URL.revokeObjectURL(a.href);
                        }, 100);
                    });
                }
            }, 0);
        });
    
        document.getElementById('text-editor2')?.addEventListener('click', () => {
            createWindow('Text Editor', 'Advanced text editing...');
        });
    
        document.getElementById('terminal2')?.addEventListener('click', () => {
            createWindow('Terminal', `
                <div class="terminal-container" style="background:black;color:lime;font-family:monospace;height:100%;width:100%;padding:0;display:flex;flex-direction:column;">
                    <div class="terminal-output" style="flex:1;overflow:auto;padding:10px;"></div>
                    <form class="terminal-form" style="display:flex;" onsubmit="return false;">
                        <span style="color:lime;">$</span>
                        <input class="terminal-input" autocomplete="off" style="flex:1;background:black;color:lime;border:none;outline:none;font-family:monospace;font-size:1em;padding:5px;" />
                    </form>
                </div>
            `);
    
            // Wait for the window to be added to the DOM
            setTimeout(() => {
                const osInterface = document.querySelector('div[os-interface]');
                const lastWindow = osInterface.querySelector('div[window]:last-child');
                if (!lastWindow) return;
                const terminalOutput = lastWindow.querySelector('.terminal-output');
                const terminalForm = lastWindow.querySelector('.terminal-form');
                const terminalInput = lastWindow.querySelector('.terminal-input');
    
                if (!terminalForm) {
                    console.error('Terminal form not found!');
                    return;
                }
    
                // Prevent default form submission (backup)
                terminalForm.onsubmit = (e) => e.preventDefault();
    
                // Focus input on open
                terminalInput.focus();
    
                // Simple shell commands
                
    
                // Extracted command runner for reuse
                function runTerminalCommand() {
                    const input = terminalInput.value.trim();
                    if (!input) return;
                    terminalOutput.innerHTML += `<div><span style="color:lime;">$</span> ${escapeHTML(input)}</div>`;
                    const [cmd, ...args] = input.split(' ');
                    let result = '';
                    if (commands[cmd]) {
                        result = commands[cmd](args);
                    } else {
                        result = `Command not found: ${cmd}`;
                    }
                    if (result) {
                        terminalOutput.innerHTML += `<div>${escapeHTML(result)}</div>`;
                    }
                    terminalInput.value = '';
                    terminalOutput.scrollTop = terminalOutput.scrollHeight;
                }
    
                // Listen for form submit
                terminalForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    runTerminalCommand();
                });
    
                // Listen for Enter key on input
                terminalInput.addEventListener('keydown', (e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        runTerminalCommand();
                    }
                });
            }, 0);
        });
    
        document.getElementById('paint2')?.addEventListener('click', () => {
            createWindow('Paint', `
                <canvas id="paint-canvas" width="380" height="220" style="border:1px solid #000; background:white; cursor:crosshair;"></canvas>
                <div>
                    <button id="clear-canvas">Clear</button>
                </div>
            `);
            setTimeout(() => {
                const osInterface = document.querySelector('div[os-interface]');
                const lastWindow = osInterface.querySelector('div[window]:last-child');
                if (!lastWindow) return;
                const canvas = lastWindow.querySelector('#paint-canvas');
                const ctx = canvas.getContext('2d');
                let drawing = false;
                canvas.addEventListener('mousedown', () => drawing = true);
                canvas.addEventListener('mouseup', () => drawing = false);
                canvas.addEventListener('mouseleave', () => drawing = false);
                canvas.addEventListener('mousemove', (e) => {
                    if (!drawing) return;
                    const rect = canvas.getBoundingClientRect();
                    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                });
                lastWindow.querySelector('#clear-canvas').addEventListener('click', () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                });
            }, 0);
        });
    
        document.getElementById('explorer2')?.addEventListener('click', () => {
            createWindow('File Explorer', `
                <div style="padding:10px;">
                    <p>This is a mock file explorer. (No real file system access in browser)</p>
                    <ul>
                        <li>Documents</li>
                        <li>Pictures</li>
                        <li>Music</li>
                        <li>Videos</li>
                    </ul>
                </div>
            `);
        });
});

function initializeWindows() {
    const windows = document.querySelectorAll('div[window]');
    windows.forEach(window => {
        makeWindowDraggable(window);
        makeWindowResizable(window);
    });
}

function makeWindowDraggable(window) {
    const titlebar = window.querySelector('.titlebar');
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    // Remove any existing event listeners to prevent duplicates
    titlebar.removeEventListener('pointerdown', titlebar._dragHandler);
    
    // Create new drag handler
    titlebar._dragHandler = (e) => {
        if (e.target.closest('.buttons')) return; // Don't drag when clicking buttons
        
        isDragging = true;
        offsetX = e.clientX - window.offsetLeft;
        offsetY = e.clientY - window.offsetTop;
        window.style.position = 'fixed';
        bringToFront(window);
        document.body.style.userSelect = 'none';
    };

    titlebar.addEventListener('pointerdown', titlebar._dragHandler);

    // Global mouse move and up handlers
    const handleMouseMove = (e) => {
        if (isDragging) {
            window.style.left = (e.clientX - offsetX) + 'px';
            window.style.top = (e.clientY - offsetY) + 'px';
        }
    };

    const handleMouseUp = () => {
        isDragging = false;
        document.body.style.userSelect = '';
    };

    // Remove existing global handlers if they exist
    document.removeEventListener('pointermove', handleMouseMove);
    document.removeEventListener('pointerup', handleMouseUp);
    
    // Add global handlers
    document.addEventListener('pointermove', handleMouseMove);
    document.addEventListener('pointerup', handleMouseUp);
}

function makeWindowResizable(window) {
    // Window is already resizable via CSS resize: both
    // This function can be used for custom resize handles if needed
}

function bringToFront(window) {
    const windows = document.querySelectorAll('div[window]');
    let maxZ = 100;
    
    windows.forEach(w => {
        const z = parseInt(w.style.zIndex) || 100;
        maxZ = Math.max(maxZ, z);
    });
    
    window.style.zIndex = maxZ + 1;
}

function createWindow(title, content) {
    // Calculate position for new window to avoid overlapping
    const existingWindows = document.querySelectorAll('div[window]');
    const offset = existingWindows.length * 30; // Stagger windows by 30px
    const left = 50 + offset;
    const top = 50 + offset;
    
    const windowHTML = `
        <div window style="padding: 10px; position: fixed; top: ${top}px; left: ${left}px; width: 400px; height: 300px;">
            <div class="titlebar" resizable="true">
                <div class="title">
                    <span>${title}</span>
                    <div class="buttons">
                        <button close-window onclick="this.closest('[window]').remove()">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                        <button minimize-window onclick="
                            const minWin = this.closest('[window]');
                            const minContent = minWin.querySelector('[window-content]');
                            const isMinimized = minWin.classList.contains('minimized');
                            
                            console.log('Minimize button clicked');
                            console.log('Current minimized state:', isMinimized);
                            console.log('Current display:', minContent.style.display);
                            console.log('Current height:', minWin.style.height);
                            
                            if (isMinimized) {
                                // Restore window
                                console.log('Restoring window...');
                                minContent.style.display = 'block';
                                if (minWin.dataset.prevHeight) {
                                    minWin.style.height = minWin.dataset.prevHeight;
                                    console.log('Restored height to:', minWin.dataset.prevHeight);
                                } else {
                                    minWin.style.height = '300px'; // Default height if none saved
                                }
                                minWin.classList.remove('minimized');
                            } else {
                                // Minimize window
                                console.log('Minimizing window...');
                                minContent.style.display = 'none';
                                minWin.dataset.prevHeight = minWin.style.height || '300px';
                                minWin.style.height = '40px';
                                minWin.classList.add('minimized');
                                console.log('Saved height:', minWin.dataset.prevHeight);
                            }
                            
                            console.log('New minimized state:', minWin.classList.contains('minimized'));
                        ">
                            <i class="fa-solid fa-minus"></i>
                        </button>
                        <button maximize-window onclick="
                            const maxWin = this.closest('[window]');
                            const maxContent = maxWin.querySelector('[window-content]');
                            const isMaximized = maxWin.classList.contains('maximized');
                            
                            if (isMaximized) {
                                // Restore window
                                maxWin.style.width = maxWin.dataset.prevWidth || '400px';
                                maxWin.style.height = maxWin.dataset.prevHeight || '300px';
                                maxWin.style.left = maxWin.dataset.prevLeft || '50px';
                                maxWin.style.top = maxWin.dataset.prevTop || '50px';
                                maxWin.classList.remove('maximized');
                                maxContent.style.resize = 'both';
                            } else {
                                // Maximize window
                                maxWin.dataset.prevWidth = maxWin.style.width;
                                maxWin.dataset.prevHeight = maxWin.style.height;
                                maxWin.dataset.prevLeft = maxWin.style.left;
                                maxWin.dataset.prevTop = maxWin.style.top;
                                maxWin.style.width = '100vw';
                                maxWin.style.height = 'calc(100vh - 35px)';
                                maxWin.style.left = '0px';
                                maxWin.style.top = '35px';
                                maxWin.classList.add('maximized');
                                maxContent.style.resize = 'none';
                            }
                        ">
                            <i class="fa-solid fa-square"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div window-content>
                ${content}
            </div>
        </div>
    `;
    
    const osInterface = document.querySelector('div[os-interface]');
    osInterface.insertAdjacentHTML('beforeend', windowHTML);
    
    // Initialize the new window
    const newWindow = osInterface.lastElementChild;
    makeWindowDraggable(newWindow);
    bringToFront(newWindow);
    // Close start menu
    document.querySelector('div[startmenu]').classList.add('hidden');
}

function escapeHTML(str) {
    if (String(str).startsWith('._html ') == true){
          // Remove <script>...</script> tags completely
        str = str.replace(/<\s*script.*?>.*?<\s*\/\s*script\s*>/gis, '');
    
        // Remove inline JS (onclick="...", onerror='...', etc.)
        str = str.replace(/on\w+\s*=\s*(['"]).*?\1/gi, '');
    
        // Remove javascript: URLs
        str = str.replace(/javascript:/gi, '');

        return String(str)
    } else {
    return str.replace(/[&<>"']/g, function(m) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[m];
    });
    }
}