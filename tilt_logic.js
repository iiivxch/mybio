// 3D Tilt Effect
const card = document.querySelector('.profile-card');
const container = document.querySelector('.main-container');

if (card && container) {
    container.addEventListener('mousemove', (e) => {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 25;

        // Inverted axis for natural feel:
        // Mouse Right (pageX high) -> xAxis negative -> RotateY negative (right side goes back)

        card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    });

    container.addEventListener('touchstart', (e) => {
        // Prevent weird touch behavior if needed, or implement touch tilt
    });

    // Reset on restart or leave?
    // Usually continuous is fine for desktop.

    container.addEventListener('mouseleave', () => {
        card.style.transform = `rotateY(0deg) rotateX(0deg)`;
        card.style.transition = 'transform 0.5s ease';
    });

    container.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.1s ease-out';
    });
}
