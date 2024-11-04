// Settings
let settings = {
    controls: {
        forward: [
            "W",
            "Up"
        ],
        backward: [
            "S",
            "Down"
        ],
        left: [
            "A",
            "Left"
        ],
        right: [
            "D",
            "Right"
        ],

        kill: [
            "Q"
        ],
        use: [
            "E"
        ]
    }
};



// CONTROLS

// Controls
let controls = {};
let updateControls = () => {
    mouse.move = mouse.accumulated.move;
    mouse.wheel = mouse.accumulated.wheel;
    mouse.accumulated.move = {x: 0, y: 0};
    mouse.accumulated.wheel = {x: 0, y: 0};
    mouse.captured = document.pointerLockElement || platform.mobile;
    if ((focused = document.hasFocus())) {
        for (let control in settings.controls) {
            let controlsHeldKeys = {};
            for (let key of settings.controls[control]) {
                if (isKeyHeld(key)) {
                    controlsHeldKeys[key] = isKeyHeld(key);
                }
            }
            if (!Object.keys(controlsHeldKeys).length) {
                delete controls[control];
            } else if (controls[control]) {
                controls[control].heldKeys = controlsHeldKeys;
                controls[control].pressed = false;
            } else {
                controls[control] = {
                    time: time.copy(),
                    heldKeys: controlsHeldKeys,
                    mouse: {
                        x: mouse.x,
                        y: mouse.y
                    },
                    pressed: true
                };
            }
        }
    } else {
        for (let control in controls) {
            delete controls[control];
        }
    }
};

// Keys
let heldKeys = {};
let isKeyHeld = key => {
    if (heldKeys[key]) {
        return heldKeys[key];
    } else if (key instanceof Object) {
        let held = true;
        for (let requiredKey of key.required) {
            held = held && isKeyHeld(requiredKey);
        }
        if (key.prohibited) {
            for (let prohibitedKey of key.prohibited) {
                held = held && !isKeyHeld(prohibitedKey);
            }
        }
        for (let heldKey in heldKeys) {
            if (key.exclusivelyRequired || key.prohibitModifiers && heldKeys[heldKey].modifier) {
                held = held && (key.required.indexOf(heldKey) > -1 || key.required.indexOf(heldKeys[heldKey].modifier) > -1);
            }
        }
        return held || undefined;
    }
    for (let heldKey in heldKeys) {
        if (heldKeys[heldKey].modifier == key) {
            return heldKeys[heldKey];
        }
    }
};
let keyFromEvent = event => {
    let key = {
        time: time.copy(),
        mouse: Object.assign({}, mouse)
    };
    if (event.type.indexOf("key") == 0) {
        key.type = "Keyboard";
        if (event.key.length == 1 && event.key.toLowerCase() != event.key.toUpperCase()) {
            key.name = event.key.toUpperCase();
        } else if (event.code.indexOf("Digit") == 0 || event.code.indexOf("Arrow") == 0) {
            key.name = event.code.slice(5);
        } else if (event.code == "ShiftLeft" || event.code == "ShiftRight") {
            key.name = event.code == "ShiftLeft" ? "Left Shift" : "Right Shift";
            key.modifier = "Shift";
            key.modifierSide = event.code == "ShiftLeft" ? "Left" : "Right";
        } else if (event.code == "ControlLeft" || event.code == "ControlRight") {
            key.name = event.code == "ControlLeft" ? "Left Control" : "Right Control";
            key.modifier = "Control";
            key.modifierSide = event.code == "ControlLeft" ? "Left" : "Right";
        } else if ((event.code == "AltLeft" || event.code == "AltRight") && platform.apple) {
            key.name = event.code == "AltLeft" ? "Left Option" : "Right Option";
            key.modifier = "Alt";
            key.modifierSide = event.code == "AltLeft" ? "Left" : "Right";
        } else if (event.code == "AltLeft" || event.code == "AltRight") {
            key.name = event.code == "AltLeft" ? "Left Alt" : "Right Alt";
            key.modifier = "Alt";
            key.modifierSide = event.code == "AltLeft" ? "Left" : "Right";
        } else if ((event.code == "MetaLeft" || event.code == "MetaRight") && platform.apple) {
            key.name = event.code == "MetaLeft" ? "Left Command" : "Right Command";
            key.modifier = "Command";
            key.modifierSide = event.code == "MetaLeft" ? "Left" : "Right";
        } else if ((event.code == "MetaLeft" || event.code == "MetaRight") && platform.windows) {
            key.name = event.code == "MetaLeft" ? "Left Windows" : "Right Windows";
            key.modifier = "Windows";
            key.modifierSide = event.code == "MetaLeft" ? "Left" : "Right";
        } else if (event.code == "MetaLeft" || event.code == "MetaRight") {
            key.name = event.code == "MetaLeft" ? "Left Super" : "Right Super";
            key.modifier = "Super";
            key.modifierSide = event.code == "MetaLeft" ? "Left" : "Right";
        } else {
            key.name = event.code == event.code.toUpperCase() ? event.code : event.code.replace(/(?!^)([A-Z])/g, " $1");
        }
    } else if (event.type.indexOf("mouse") == 0) {
        key.type = "Mouse";
        key.name = (event.button == 0 ? "Left Mouse Button" : event.button == 1 ? "Mouse Wheel" : event.button == 2 ? "Right Mouse Button" : event.which + "th Mouse Button");
    } else {
        key.type = key.name = "Unknown Device";
    }
    return key;
};
let focused = platform.client && document.hasFocus();

// Mouse
let mouse = {
    pos: {x: 0, y: 0},
    move: {x: 0, y: 0},
    wheel: {x: 0, y: 0},
    captured: false,
    accumulated: {
        move: {x: 0, y: 0},
        wheel: {x: 0, y: 0}
    }
};

// Events
if (platform.client) {
    // Keyboard & Mouse
    window.onkeydown = window.onmousedown = event => {
        let key = keyFromEvent(event);
        heldKeys[key.name] = heldKeys[key.name] || key;
    };
    window.onkeyup = window.onmouseup = event => delete heldKeys[keyFromEvent(event).name];
    window.oncontextmenu = event => event.preventDefault();
    window.onmousemove = event => {
        mouse.pos.x = event.clientX;
        mouse.pos.y = event.clientY;
        mouse.accumulated.move.x += event.movementX;
        mouse.accumulated.move.y += event.movementY;
    };
    window.onwheel = event => {
        mouse.accumulated.wheel.x += event.deltaX;
        mouse.accumulated.wheel.y += event.deltaY;
    };
    // Touch
    window.ontouchstart = event => {
        window.ontouchmove(event);
        if (event.touches.length == 1) {
            window.onmousedown(new MouseEvent("mousedown", {button: 0}));
        } else {
            window.onmouseup(new MouseEvent("mouseup", {button: 0}));
            window.onmousedown(new MouseEvent("mousedown", {button: 2}));
        }
    };
    window.ontouchend = event => {
        if (event.touches.length < 2) {
            if (event.touches.length == 0) {
                window.onmouseup(new MouseEvent("mouseup", {button: 0}));
            } else {
                window.onmousedown(new MouseEvent("mousedown", {button: 0}));
            }
            window.onmouseup(new MouseEvent("mouseup", {button: 2}));
        }
    };
    window.ontouchmove = event => {
        let clientX = 0;
        let clientY = 0;
        for (let i = 0; i < event.touches.length; i++) {
            clientX += event.touches[i].clientX / event.touches.length;
            clientY += event.touches[i].clientY / event.touches.length;
        }
        window.onmousemove(new MouseEvent("mousemove", {
            clientX: clientX,
            clientY: clientY,
            movementX: event.type == "touchmove" ? clientX - mouse.pos.x : 0,
            movementY: event.type == "touchmove" ? clientY - mouse.pos.y : 0
        }))
    };
    // Window
    window.onblur = () => heldKeys = {};
    window.onbeforeunload = () => settings.confirmExit ? true : undefined;
}



// Canvas
let canvas = {
    context: document.getElementById("canvas").getContext("2d"),
    scale: 1,
    global: {
        left: 0,
        top: 0,
        right: 1600,
        bottom: 900,
        width: 1600,
        height: 900
    },
    screen: {
        left: 0,
        top: 0,
        right: 1600,
        bottom: 900,
        width: 1600,
        height: 900
    }
};

// Debug Settings
let debug = { noBoundsColl: false, noObjColl: false };

// Player Position
let player = { x: 50, y: 50, speed: .5 };

// Game State
let gameTick = 0;

let frame = () => {
    // Count Game Ticks
    gameTick++;

    // Controls
    updateControls();

    // Move The Player
    let horizontal = (controls.right - controls.left) * player.speed;
    let vertical = (controls.backward - controls.forward) * player.speed;
    if (horizontal != 0 && vertical != 0) {
        horizontal *= .707;
        vertical *= .707;
    }
    player.x += horizontal;
    player.y += vertical;

    // Move Player In Bounds
    if (!debug.noBoundsColl) {
        // TODO
    }

    // Canvas
    canvas.scale = Math.max(window.innerWidth / canvas.global.width, window.innerHeight / canvas.global.height);
    canvas.screen.left = canvas.global.width * .5 - window.innerWidth / canvas.scale * .5;
    canvas.screen.top = canvas.global.height * .5 - window.innerHeight / canvas.scale * .5;
    canvas.screen.right = canvas.global.width - canvas.screen.left;
    canvas.screen.bottom = canvas.global.height - canvas.screen.top;
    canvas.screen.width = canvas.screen.right - canvas.screen.left;
    canvas.screen.height = canvas.screen.bottom - canvas.screen.top;
    document.getElementById("canvas").setAttribute("width", window.innerWidth + "px");
    document.getElementById("canvas").setAttribute("height", window.innerHeight + "px");
    canvas.context.translate(-canvas.screen.left * canvas.scale, -canvas.screen.top * canvas.scale);
    // for (let i = 0; i < 45; i++) {
    //     drawRect(i * 10, i * 10, canvas.global.width - i * 20, canvas.global.height - i * 20, i == 0 ? "#F00" : i % 2 == 0 ? "#666" : "#000");
    // }
    // for (let i = 0; i < 30; i++) {
    //     drawRect(canvas.screen.left + i * 10, canvas.screen.top + i * 10, canvas.screen.width - i * 20, canvas.screen.height - i * 20, i == 0 ? "#F00" : i % 2 == 0 ? "#666" : "#000");
    // }

    // Move And Draw Objects And Detect Hits
    /*var hit = false;
    for (var i = 0; i < objects.length; i++) {
        var obj = objects[i];
        switch (obj.type) {
            case "bullet": {
                obj.x += obj.vel.x;
                obj.y += obj.vel.y;
                if (obj.x < -obj.size || obj.y < -obj.size || obj.x > obj.size + 100 || obj.y > obj.size + 100) {
                    objects.splice(obj, 1);
                    break;
                }
                drawCircle(obj.x, obj.y, obj.size, "#FFF");
                if ((obj.x - player.x) * (obj.x - player.x) + (obj.y - player.y) * (obj.y - player.y) < (obj.size + 1) * (obj.size + 1)) {
                    hit = true;
                }
                break;
            }
            case "blast": {
                if (obj.explosion.delay + obj.explosion.expansion + obj.explosion.decay == 0) {
                    objects.splice(obj, 1);
                    break;
                } else if (obj.explosion.delay + obj.explosion.expansion == 0) {
                    obj.size -= obj.size / obj.explosion.decay--;
                } else if (obj.explosion.delay == 0) {
                    obj.size += (obj.explosion.size - obj.size) / obj.explosion.expansion--;
                } else {
                    obj.explosion.delay--;
                }
                drawLine(obj.x, obj.y, obj.rotation, obj.size, obj.explosion.delay == 0 ? "#FFF" : "#FFF8");
                const rotation = obj.rotation * Math.PI / 180;
                const x1 = obj.x - Math.cos(rotation) * 200;
                const y1 = obj.y - Math.sin(rotation) * 200;
                const x2 = obj.x + Math.cos(rotation) * 200;
                const y2 = obj.y + Math.sin(rotation) * 200;
                if (obj.explosion.delay == 0 && (Math.abs((y2 - y1) * player.x - (x2 - x1) * player.y + x2 * y1 - y2 * x1) / Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1)) * 2 < obj.size + 2)) {
                    hit = true;
                }
                break;
            }
            case "ring": {
                obj.x += obj.vel.x;
                obj.y += obj.vel.y;
                if (obj.radius == obj.finalRadius) {
                    objects.splice(obj, 1);
                    break;
                }
                if (obj.radius > obj.finalRadius) {
                    obj.radius = Math.max(obj.radius + obj.vel.radius, obj.finalRadius);
                } else if (obj.radius < obj.finalRadius) {
                    obj.radius = Math.min(obj.radius + obj.vel.radius, obj.finalRadius);
                }
                drawRing(obj.x, obj.y, obj.radius, obj.width, "#FFF");
                var dif = Math.sqrt((obj.x - player.x) * (obj.x - player.x) + (obj.y - player.y) * (obj.y - player.y)) - obj.radius;
                if (dif < obj.width * .5 + 1 && dif > obj.width * -.5 - 1) {
                    hit = true;
                }
                break;
            }
            // TODO Lines
            // TODO Homing Bullets
        }
    }

    // Draw Player And End Game If Hit
    if (hit) {
        if (!debug.noObjColl) {
            notStarted = 0;
        }
        drawCircle(player.x, player.y, 1, "#800");
    } else {
        drawCircle(player.x, player.y, 1, "#F00");
    }*/
};

// Canvas Drawing Functions
function drawRect(x, y, width, height, color) {
    canvas.context.fillStyle = color;
    canvas.context.fillRect(x * canvas.scale, y * canvas.scale, width * canvas.scale, height * canvas.scale);
}
function clearRect(x, y, width, height) {
    canvas.context.clearRect(x * canvas.scale, y * canvas.scale, width * canvas.scale, height * canvas.scale);
}
function drawCircle(x, y, radius, color) {
    canvas.context.fillStyle = color;
    canvas.context.beginPath();
    canvas.context.arc(x * canvas.scale, y * canvas.scale, radius * canvas.scale, 0, 2 * Math.PI);
    canvas.context.fill();
}
function drawRing(x, y, radius, width, color) {
    canvas.context.strokeStyle = color;
    canvas.context.beginPath();
    canvas.context.arc(x * canvas.scale, y * canvas.scale, radius * canvas.scale, 0, 2 * Math.PI);
    canvas.context.lineWidth = width * canvas.scale;
    canvas.context.stroke();
}
function drawLine(x, y, angle, size, color) {
    canvas.context.beginPath();
    canvas.context.strokeStyle = color;
    canvas.context.lineWidth = size * canvas.scale;
    let radians = angle * Math.PI / 180;
    canvas.context.moveTo((x - Math.cos(radians) * 200) * canvas.scale, (y - Math.sin(radians) * 200) * canvas.scale);
    canvas.context.lineTo((x + Math.cos(radians) * 200) * canvas.scale, (y + Math.sin(radians) * 200) * canvas.scale);
    canvas.context.stroke();
}

// Frame Loop
setInterval(frame, 20);
