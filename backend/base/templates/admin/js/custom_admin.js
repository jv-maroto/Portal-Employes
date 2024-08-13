document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    form.addEventListener('submit', function() {
        const progressBarContainer = document.querySelector('#progress-bar-container');
        const progressBar = document.querySelector('#progress-bar');

        if (progressBarContainer && progressBar) {
            progressBarContainer.style.display = 'block';

            let progress = 0;
            const interval = setInterval(function() {
                progress += 10; // Simulación de progreso
                progressBar.value = progress;
                if (progress >= 100) {
                    clearInterval(interval);
                }
            }, 500);
        }
    });
});
