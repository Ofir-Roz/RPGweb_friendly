// Emscripten runtime configuration for WebAssembly module

const statusElement = document.querySelector("#status");
const progressElement = document.querySelector("#progress");
const spinnerElement = document.querySelector("#spinner");

window.Module = {
    preRun: [],
    postRun: [],
    
    print: (() => {
        const output = document.querySelector("#output");
        return function(text) {
            if (arguments.length > 1) {
                text = Array.prototype.slice.call(arguments).join(" ");
            }
            console.log(text);
            if (output) {
                output.value += text + "\n";
                output.scrollTop = output.scrollHeight;
            }
        };
    })(),
    
    printErr: function(text) {
        if (arguments.length > 1) {
            text = Array.prototype.slice.call(arguments).join(" ");
        }
        console.error(text);
    },
    
    canvas: (() => {
        const canvas = document.querySelector("#canvas");
        canvas.addEventListener("webglcontextlost", e => {
            alert("WebGL context lost. You will need to reload the page.");
            e.preventDefault();
        });
        return canvas;
    })(),
    
    setStatus: function(msg) {
        if (!Module.setStatus.last) {
            Module.setStatus.last = { time: Date.now(), text: "" };
        }
        
        if (msg !== Module.setStatus.last.text) {
            const match = msg.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
            const now = Date.now();
            
            if (!match || now - Module.setStatus.last.time >= 30) {
                Module.setStatus.last.time = now;
                Module.setStatus.last.text = msg;
                
                if (match) {
                    msg = match[1];
                    progressElement.value = 100 * parseInt(match[2]);
                    progressElement.max = 100 * parseInt(match[4]);
                    progressElement.hidden = true;
                    spinnerElement.hidden = false;
                } else {
                    progressElement.hidden = true;
                    if (!msg) spinnerElement.style.display = "none";
                }
                statusElement.innerHTML = msg;
            }
        }
    },
    
    totalDependencies: 0,
    monitorRunDependencies: function(left) {
        this.totalDependencies = Math.max(this.totalDependencies, left);
        Module.setStatus(left ? 
            "Preparing... (" + (this.totalDependencies - left) + "/" + this.totalDependencies + ")" : 
            "All downloads complete.");
    }
};

Module.setStatus("Downloading...");

window.onerror = function() {
    Module.setStatus("Exception thrown, see JavaScript console");
    spinnerElement.style.display = "none";
    Module.setStatus = function(msg) {
        if (msg) Module.printErr("[post-exception status] " + msg);
    };
};
