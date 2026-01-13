window.cursorEffects = (() => {
    let canvas, ctx;
    let particles = [];
    let animationFrame;
    let currentEffect = 'none';
    let mouse = { x: 0, y: 0 };
    let isActive = false;

    class Particle {
        constructor(x, y, type) {
            this.x = x;
            this.y = y;
            this.type = type;
            this.life = 1.0; // 1.0 to 0.0

            if (type === 'snow') {
                this.vx = (Math.random() - 0.5) * 2;
                this.vy = Math.random() * 2 + 1; // Falling down
                this.size = Math.random() * 3 + 2;
                this.color = '#ffffff';
                this.decay = 0.01;
            } else if (type === 'bubbles') {
                this.vx = (Math.random() - 0.5) * 1;
                this.vy = -(Math.random() * 2 + 1); // Floating up
                this.size = Math.random() * 4 + 2;
                this.color = 'rgba(255, 255, 255, 0.3)';
                this.decay = 0.015;
                this.wobble = Math.random() * Math.PI * 2;
            } else if (type === 'fire') {
                this.vx = (Math.random() - 0.5) * 3;
                this.vy = -(Math.random() * 3 + 2); // Rising fast
                this.size = Math.random() * 6 + 4;
                // Random fire colors
                const colors = ['#ff0000', '#ff4500', '#ffa500', '#ffff00'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.decay = 0.04;
            }
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life -= this.decay;

            if (this.type === 'bubbles') {
                this.x += Math.sin(this.life * 10 + this.wobble) * 0.5;
            }

            if (this.type === 'fire') {
                this.size *= 0.95; // Shrink
            }
        }

        draw(ctx) {
            ctx.fillStyle = this.color;
            ctx.beginPath();

            if (this.type === 'bubbles') {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.stroke();
                // Shine
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.globalAlpha = this.life;
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }
        }
    }

    function init() {
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'cursor-effects-canvas';
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '9999';
            document.body.appendChild(canvas);
            ctx = canvas.getContext('2d');

            window.addEventListener('resize', resize);
            resize();

            document.addEventListener('mousemove', (e) => {
                mouse.x = e.clientX;
                mouse.y = e.clientY;
                if (isActive) spawn(3); // Spawn on move
            });
        }
    }

    function resize() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }

    function spawn(count) {
        if (currentEffect === 'none') return;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(mouse.x, mouse.y, currentEffect));
        }
    }

    function loop() {
        if (!isActive) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw(ctx);
            if (particles[i].life <= 0 || particles[i].size <= 0.1) {
                particles.splice(i, 1);
            }
        }

        animationFrame = requestAnimationFrame(loop);
    }

    function setEffect(effect) {
        if (effect === currentEffect) return;
        currentEffect = effect;
        particles = []; // Clear old particles

        if (effect === 'none') {
            isActive = false;
            if (animationFrame) cancelAnimationFrame(animationFrame);
            if (canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
            init(); // Ensure canvas exists
            if (!isActive) {
                isActive = true;
                loop();
            }
        }
    }

    return {
        setEffect: setEffect
    };
})();
