// Ждем, пока вся HTML-страница полностью загрузится
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ИНИЦИАЛИЗАЦИЯ КАРТЫ ---
    const map = L.map('map').setView([60, 90], 4); // Центр на России, масштаб 4
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // --- 2. ПОЛУЧЕНИЕ ДАННЫХ ---
    // !!! ИСПОЛЬЗУЕМ ВАШУ РЕАЛЬНУЮ ССЫЛКУ !!!
    const DATA_URL = 'https://cdn.jsdelivr.net/gh/Kudinov1982/history-map/historical_events.json';
    
    let allEvents = [];
    let markersLayer = L.layerGroup().addTo(map);
    const yearSlider = document.getElementById('year-slider');
    const yearDisplay = document.getElementById('year-display');

    // --- 3. ГЛАВНАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ КАРТЫ ---
    function updateMap(year) {
        markersLayer.clearLayers();
        const eventsForYear = allEvents.filter(event => event.year === parseInt(year));
        eventsForYear.forEach(event => {
            const marker = L.marker([event.lat, event.lon]);
            marker.bindPopup(`<b>${event.name}</b><br>Тип: ${event.type}<br>Место: ${event.location}`);
            markersLayer.addLayer(marker);
        });
    }

    // --- 4. ЗАГРУЗКА ДАННЫХ И ПЕРВЫЙ ЗАПУСК ---
    fetch(DATA_URL)
        .then(response => response.json())
        .then(data => {
            allEvents = data;
            console.log(`Данные успешно загружены. Всего событий: ${allEvents.length}`);
            const initialYear = yearSlider.value;
            updateMap(initialYear);
        })
        .catch(error => console.error('Ошибка загрузки данных:', error));

    // --- 5. СВЯЗЫВАЕМ СЛАЙДЕР С КАРТОЙ ---
    yearSlider.addEventListener('input', (event) => {
        const selectedYear = event.target.value;
        yearDisplay.textContent = selectedYear;
        updateMap(selectedYear);
    });
});