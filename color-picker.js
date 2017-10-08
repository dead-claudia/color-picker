/**
 * @license
 * Copyright (c) 2017 and later, Isiah Meadows <me@isiahmeadows.com>.
 * Licensed under the ISC License.
 */

;(function () { // eslint-disable-line no-extra-semi, max-statements
    "use strict"

    var initialized = false
    var listenerOpts = false
    var colorPickerElem

    function initialize() {
        if (initialized) return
        var style = document.createElement("style")

        style.innerHTML =
            ".im-color-picker{" +
                "contain:strict;" +
                "overflow:hidden;" +
                "background-color:#f00;" +
                "border:1px solid black;" +
                "font-family:Helvetica, Arial, sans-serif;" +
                "will-change:background-color;" +
            "}" +

            ".im-color-picker-scroll{" +
                "will-change:scroll-position;" +
                "overflow-x:hidden;" +
                "overflow-y:scroll;" +
                "-ms-overflow-style:none;" +
                "margin-right:-20px;" +
                "padding-right:20px;" +
            "}" +

            ".im-color-picker-scroll::-webkit-scrollbar{" +
                "display:none;" +
            "}" +

            ".im-color-picker," +
            ".im-color-picker-scroll{" +
                "margin:0;" +
                "height:100%;" +
                "width:100%;" +
            "}" +

            ".im-color-picker-scroll div{" +
                "margin:0;" +
                "height:20em;" +
                "width:100%;" +
            "}" +

            ".im-color-picker-label{" +
                "width:12em;" +
                "will-change:background-color;" +
                "text-align:center;" +
                "letter-spacing:0.01em;" +
                "position:absolute;" +
                "left:50%;" +
                "transform:translateX(-50%);" +
                "bottom:10%;" +
                "background-color:#f88;" +
                "padding:1em;" +
                "color:#444;" +
                "border-radius:1.2em;" +
                "font-size:1.2em;" +
            "}" +

            ".im-color-picker-overlay>div{" +
                "display:table-cell;" +
                "vertical-align:middle;" +
            "}" +

            ".im-color-picker-overlay>div>div{" +
                "width:100%;" +
                "padding:0.25em 0;" +
                "font-size:1.2em;" +
                "color:#222" +
            "}" +

            /* -fail- */
            "@-webkit-keyframes f{" +
                "from{opacity:0}" +
                "to{opacity:1}" +
            "}" +
            "@keyframes f{" +
                "from{opacity:0}" +
                "to{opacity:1}" +
            "}" +

            ".im-color-picker-overlay{" +
                "transition:opacity .5s;" +
                "opacity:0;" +
                "display:table;" +
                "position:absolute;" +
                "width:100%;" +
                "height:100%;" +
                "top:0;" +
                "left:0;" +
                "background-color:#aaa;" +
                "background-color:#aaad;" +
                "text-align:center;" +
            "}" +

            ".im-color-picker-show{" +
                "opacity:1;" +
            "}" +

            ".im-color-picker-active," +
            ".im-color-picker-active .im-color-picker-label{" +
                "will-change:background-color;" +
            "}" +

            ".im-color-picker-active .im-color-picker-label>div{" +
                "will-change:contents;" +
            "}" +

        document.head.appendChild(style)

        var desc = {get: function () { listenerOpts = {passive: true} }}

        try {
            Object.defineProperty(desc, "passive", desc)
            window.addEventListener("test", desc, desc)
            window.removeEventListener("test", desc, desc)
        } catch (_) {
            // ignore
        }

        colorPickerElem = document.createElement("div")

        colorPickerElem.className = "im-color-picker"
        colorPickerElem.innerHTML =
            "<div class=im-color-picker-scroll>" +
                "<div></div><div></div><div></div><div></div>" +
                "<div></div><div></div><div></div><div></div>" +
            "</div>" +
            "<div class=im-color-picker-label>" +
                "<div></div><div></div><div></div>" +
            "</div>" +
            "<div class=im-color-picker-overlay><div>" +
                "<div>Click to use, then click to select</div>" +
                "<div>Move left or right to change the hue</div>" +
                "<div>Move up or down to change the brightness</div>" +
                "<div>Scroll up or down to change the vividness</div>" +
            "</div></div>"

        initialized = true
    }

    function on(elem, event, listener) {
        elem.addEventListener(event, listener, listenerOpts)
    }

    function off(elem, event, listener) {
        elem.removeEventListener(event, listener, listenerOpts)
    }

    function clampDeg(x) {
        return (x % 360 + 360) % 360
    }

    function clamp(x, lo, hi) {
        if (x > hi) return hi
        if (x < lo) return lo
        return x
    }

    function colorPicker(opts) {
        initialize()
        return new ColorPicker(opts || {}).root
    }

    /**
    * Colors are represented internally as HSV tuples. We accept RGB hex
    * and component variants as well as HSL, for easier use.
    */
    function initColor(picker) { // eslint-disable-line max-statements
        var r, g, b

        picker.h = 0; picker.s = 0; picker.v = 0

        if (typeof picker.opts.initial === "string") {
            if (!/^#[\da-f]{3,}/i.test(picker.opts.initial)) {
                picker.s = 1; picker.v = 1
                return
            }

            // Note: we need to move them into the range [0, 1), since that's
            // how our conversion process works.
            if (picker.opts.initial.length >= 7) {
                r = parseInt(picker.opts.initial.slice(1, 3), 16) / 256
                g = parseInt(picker.opts.initial.slice(3, 5), 16) / 256
                b = parseInt(picker.opts.initial.slice(5, 7), 16) / 256
            } else {
                r = parseInt(picker.opts.initial[1], 16) / 16
                g = parseInt(picker.opts.initial[2], 16) / 16
                b = parseInt(picker.opts.initial[3], 16) / 16
            }
        } else if (typeof picker.opts.initial !== "object" ||
                picker.opts.initial == null) {
            picker.s = 1; picker.v = 1
            return
        } else if (picker.opts.initial.h != null) {
            picker.h = clampDeg(+picker.opts.initial.h)
            picker.s = clamp(+picker.opts.initial.s / 100, 0, 1)
            picker.v = clamp(+picker.opts.initial.v / 100, 0, 1)
            return
        } else {
            // Note: we need to move them into the range [0, 1), since that's
            // how our conversion process works.
            r = clamp(picker.opts.initial.r / 256, 0, 1)
            g = clamp(picker.opts.initial.g / 256, 0, 1)
            b = clamp(picker.opts.initial.b / 256, 0, 1)
        }

        // Now, for the actual conversion
        // https://en.wikipedia.org/wiki/HSL_and_HSV#Formal_derivation
        var max = Math.max(r, g, b)
        var min = Math.min(r, g, b)

        if (max !== 0) {
            var chroma = max - min

            if (chroma === 0) {
                picker.h = 0
            } else if (max === r) {
                picker.h = clampDeg((g - b) * 60 / chroma)
            } else if (max === g) {
                picker.h = (b - r) * 60 / chroma + 120
            } else {
                picker.h = (r - g) * 60 / chroma + 240
            }
            picker.s = clamp(chroma / max, 0, 1)
            picker.v = max
        }
    }

    function ColorPicker(opts) { // eslint-disable-line max-statements
        // Build the state and DOM tree
        this.opts = opts
        this.type = "hex"
        this.prev = 0

        this.overlayDisplayed = false
        this.timer = undefined
        this.hover = "init"
        this.scrollNatural = false

        this.root = colorPickerElem.cloneNode(true)
        this.scroll = this.root.firstChild
        this.label = this.scroll.nextSibling
        this.overlay = this.label.nextSibling

        // The overlay is packaged with it to ease creation
        this.root.removeChild(this.overlay)
        if (this.opts.label != null && !this.opts.label) {
            this.root.removeChild(this.label)
            this.label = undefined
        }

        this.offsetWidth = 0
        this.clientWidth = 0
        this.clientHeight = 0

        initColor(this)

        // Set up all the events we care about
        on(this.root, "click", this)
        on(this.root, "resize", this)
        on(this.root, "mouseenter", this)
        on(this.root, "mouseleave", this)
        on(this.root, "color-picker.scroll-normal", this)
        on(this.root, "color-picker.scroll-natural", this)
        on(this.scroll, "scroll", this)
        on(this.overlay, "webkitTransitionEnd", this)
        on(this.overlay, "transitionend", this)

        // Set the initial scroll height to 20em * 16px / 2
        this.prev = this.scroll.scrollTop = 160

        invoke(this, this.opts.onchange)

        // Set the initial proportions as soon as it gets added to the live DOM.
        // This risks a scrollbar flash in the process, but there's a CSS
        // fallback that tries to mitigate this
        var self = this

        ;(function initProportions() {
            if (document.body.contains(self.root)) {
                if (self.offsetWidth === 0) {
                    // Store the initial values once we scroll so we aren't
                    // triggering layout recalcs every time the user moves their
                    // pointer
                    self.offsetWidth = self.root.offsetWidth
                    self.clientWidth = self.root.clientWidth
                    self.clientHeight = self.root.clientHeight

                    var padding = self.offsetWidth - self.clientWidth

                    self.scroll.style.marginRight = -padding + "px"
                    self.scroll.style.paddingRight = padding + "px"

                    self.prev = self.scroll.scrollTop =
                        self.scroll.scrollHeight / 2
                }
            } else {
                requestAnimationFrame(initProportions)
            }
        })()
    }

    /* eslint-disable max-statements */
    ColorPicker.prototype.handleEvent = function (ev) {
        /* eslint-enable max-statements */
        switch (ev.type) {
        case "mousemove":
            this.h = clampDeg(this.h + ev.movementX * 0.4)
            this.v = clamp(this.v - ev.movementY / 380, 0, 1)
            invoke(this, this.opts.onchange)
            break

        case "scroll":
            var scrollTop = this.scroll.scrollTop
            var scrollHeight = this.scroll.scrollHeight
            var scrollFirst = this.scroll.firstChild

            if (this.root === document.pointerLockElement) {
                var diff = (this.prev - scrollTop) / scrollHeight

                if (this.scrollNatural) diff = -diff
                this.s = clamp(this.s + diff * 5, 0, 1)
                invoke(this, this.opts.onchange)
            }

            if (scrollTop + scrollFirst.clientHeight * 2 >= scrollHeight) {
                this.scroll.appendChild(scrollFirst)
                this.prev = this.scroll.scrollTop = scrollHeight / 2
            } else if (scrollTop <= scrollFirst.clientHeight) {
                this.scroll.insertBefore(this.scroll.lastChild, scrollFirst)
                this.prev = this.scroll.scrollTop = scrollHeight / 2
            } else {
                this.prev = scrollTop
            }
            break

        case "click":
            if (this.root === document.pointerLockElement) {
                document.exitPointerLock()
            } else {
                if (this.label != null && this.label.contains(ev.target)) return
                on(document, "pointerlockchange", this)
                on(document, "mozpointerlockchange", this)
                on(document, "pointerlockerror", this)
                on(document, "mozpointerlockerror", this)
                this.root.requestPointerLock()
            }
            break

        case "pointerlockerror":
        case "mozpointerlockerror":
            off(document, "pointerlockchange", this)
            off(document, "mozpointerlockchange", this)
            off(document, "pointerlockerror", this)
            off(document, "mozpointerlockerror", this)
            if (typeof this.opts.error === "function") {
                this.opts.onerror(ev)
            } else {
                console.error(ev)
            }
            break

        case "pointerlockchange":
        case "mozpointerlockchange":
            if (this.root === document.pointerLockElement) {
                cancelOverlay(this)
                this.hover = "locked"

                this.prev = this.scroll.scrollTop = this.scroll.scrollHeight / 2
                on(this.root, "mousemove", this)
                this.root.classList.add("im-color-picker-active")
            } else {
                off(document, "pointerlockchange", this)
                off(document, "mozpointerlockchange", this)
                off(document, "pointerlockerror", this)
                off(document, "mozpointerlockerror", this)
                off(this.root, "mousemove", this)

                this.hover = "ready"
                invoke(this, this.opts.onselect)
            }
            break

        case "resize":
            this.prev = this.scroll.scrollTop = this.scroll.scrollHeight / 2
            this.offsetWidth = this.root.offsetWidth
            this.clientWidth = this.root.clientWidth
            this.clientHeight = this.root.clientHeight
            break

        case "mouseenter":
            if (this.root === document.pointerLockElement) return
            if (this.hover === "init") {
                this.hover = "ready"
                displayOverlay(this)
            } else if (this.hover === "ready") {
                this.timer = setTimeout(displayOverlay, 7500, this)
            }
            break

        case "mouseleave":
            cancelOverlay(this)
            break

        case "webkitTransitionEnd":
        case "transitionend":
            if (!this.overlayDisplayed) {
                this.root.removeChild(this.overlay)
            }
            break

        case "color-picker.scroll-natural":
            this.scrollNatural = true
            break

        case "color-picker.scroll-normal":
            this.scrollNatural = false
            break

        default:
            // ignore
        }
    }

    function cancelOverlay(picker) {
        if (picker.overlayDisplayed) {
            picker.overlayDisplayed = false
            picker.overlay.classList.remove("im-color-picker-show")
        }

        if (picker.timer != null) {
            clearTimeout(picker.timer)
            picker.timer = undefined
        }
    }

    function displayOverlay(picker) {
        clearTimeout(picker.timer)

        if (!picker.overlayDisplayed) {
            picker.root.appendChild(picker.overlay)
            picker.overlayDisplayed = true
            // The double-frame wait is required to trigger the transition
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    picker.overlay.classList.add("im-color-picker-show")
                })
            })
        }

        picker.timer = setTimeout(cancelOverlay, 15000, picker)
    }

    function invoke(picker, hook) { // eslint-disable-line max-statements
        var r = 0
        var g = 0
        var b = 0

        // Convert the HSV color to RGB for rendering and returning
        if (picker.s === 0) {
            r = g = b = clamp(Math.floor(picker.v * 256), 0, 255)
        } else if (picker.v !== 0) {
            var chroma = picker.s * picker.v
            var min = picker.v - chroma
            var x = chroma * (1 - Math.abs(picker.h / 60 % 2 - 1))

            if (0 <= picker.h && picker.h < 60) {
                r = chroma; g = x
            } else if (60 <= picker.h && picker.h < 120) {
                r = x; g = chroma
            } else if (120 <= picker.h && picker.h < 180) {
                g = chroma; b = x
            } else if (180 <= picker.h && picker.h < 240) {
                g = x; b = chroma
            } else if (240 <= picker.h && picker.h < 300) {
                b = chroma; r = x
            } else if (picker.h >= 300) {
                b = x; r = chroma
            }

            r = clamp(Math.floor((r + min) * 256), 0, 255)
            g = clamp(Math.floor((g + min) * 256), 0, 255)
            b = clamp(Math.floor((b + min) * 256), 0, 255)
        }

        // Convert the RGB value to a hex string
        var hex = "#"

        if (r < 16) hex += "0"; hex += r.toString(16)
        if (g < 16) hex += "0"; hex += g.toString(16)
        if (b < 16) hex += "0"; hex += b.toString(16)

        picker.root.style.backgroundColor = hex

        var labelR = clamp(Math.floor(r + 128), 0, 255)
        var labelG = clamp(Math.floor(g + 128), 0, 255)
        var labelB = clamp(Math.floor(b + 128), 0, 255)
        var labelBGHex = "#"

        if (labelR < 16) labelBGHex += "0"; labelBGHex += labelR.toString(16)
        if (labelG < 16) labelBGHex += "0"; labelBGHex += labelG.toString(16)
        if (labelB < 16) labelBGHex += "0"; labelBGHex += labelB.toString(16)

        if (picker.label != null) {
            var labelHex = picker.label.firstChild
            var labelRGB = labelHex.nextSibling
            var labelHSL = labelRGB.nextSibling

            picker.label.style.backgroundColor = labelBGHex
            labelHex.textContent = hex

            labelRGB.textContent = "rgb(" + r + ", " + g + ", " + b + ")"

            // The lightness of the HSL value
            var l = (2 - picker.s) * picker.v / 2

            labelHSL.textContent = "hsl(" +
                clampDeg(Math.round(picker.h)) + ", " +
                Math.round(l !== 0 && l < 1
                    ? picker.s * picker.v / (l < 0.5 ? l * 2 : 2 - l * 2) * 100
                    : 0) + "%, " +
                Math.round(l * 100) + "%)"
        }

        if (typeof hook !== "function") return
        if (picker.type === "hex") {
            hook.call(picker.opts, hex)
        } else if (picker.type === "hsv") {
            hook.call(picker.opts, picker.h, picker.s, picker.v)
        } else {
            hook.call(picker.opts, r, g, b)
        }
    }

    /* eslint-disable no-undef */
    if (typeof module === "object" && module != null &&
            module.exports) {
        module.exports = colorPicker
    } else if (typeof define === "function" && define.amd) {
        define("color-picker", function () { return colorPicker })
    } else {
        window.colorPicker = colorPicker
    }
    /* eslint-enable no-undef */
})(); // eslint-disable-line semi
