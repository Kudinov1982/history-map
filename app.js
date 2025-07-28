// Ждем, пока загрузится API Яндекс.Карт, и только потом выполняем наш код
ymaps.ready(init);

function init() {
    // --- 1. ИНИЦИАЛИЗАЦИЯ КАРТЫ ---
    const myMap = new ymaps.Map('map', {
        center: [58, 65], // Координаты сфокусированы на России
        zoom: 4,
        controls: ['zoomControl'] // Оставляем только кнопки масштаба
    });

    // --- 2. ПОЛУЧЕНИЕ ДАННЫХ ---
    // Ссылка на ваш новый файл с обогащенными данными
    const DATA_URL = 'https://cdn.jsdelivr.net/gh/Kudinov1982/history-map/historical_events_rich.json';
    
    let allEvents = [];
    // Создаем коллекцию для хранения наших меток (аналог LayerGroup в Leaflet)
    let placemarksCollection = new ymaps.GeoObjectCollection(null, {});
    myMap.geoObjects.add(placemarksCollection);

    const yearSlider = document.getElementById('year-slider');
    const yearDisplay = document.getElementById('year-display');

    // --- 3. ГЛАВНАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ КАРТЫ ---
    function updateMap(year) {
        // Очищаем коллекцию от старых меток
        placemarksCollection.removeAll();

        const eventsForYear = allEvents.filter(event => event.year === parseInt(year));

        eventsForYear.forEach(event => {
            // Создаем HTML-содержимое для балуна (всплывающего окна)
            const balloonContent = `
                <div class="custom-balloon">
                    <div class="custom-balloon__title">${event.name}</div>
                    <div class="custom-balloon__content">
                        ${event.extract || 'Описание отсутствует.'}
                        ${event.wiki_url ? `<hr class="custom-balloon__divider"><a href="${event.wiki_url}" target="_blank">Читать в Википедии</a>` : ''}
                    </div>
                </div>
            `;

            const placemark = new ymaps.Placemark(
                [event.lat, event.lon], // Координаты метки
                {
                    balloonContent: balloonContent,
                    hintContent: event.name 
                }, 
                {
                    preset: 'islands#blueDotIcon'
                }
            );
            
            placemarksCollection.add(placemark);
        });
    }

    // --- 4. ЗАГРУЗКА ДАННЫХ И ПЕРВЫЙ ЗАПУСК ---
    fetch(DATA_URL)
        .then(response => response.json())
        .then(data => {
            allEvents = data;
            console.log(`Обогащенные данные успешно загружены. Всего событий: ${allEvents.length}`);
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
}