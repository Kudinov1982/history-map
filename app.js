// Ждем, пока загрузится API Яндекс.Карт
ymaps.ready(init);

function init() {
    // --- 1. НАСТРОЙКИ И ИНИЦИАЛИЗАЦИЯ ---
    const myMap = new ymaps.Map('map', { center: [58, 65], zoom: 4, controls: ['zoomControl'] });
    const DATA_URL = 'https://cdn.jsdelivr.net/gh/Kudinov1982/history-map/historical_events_MAX.json';
    
    const EVENT_COLORS = {
        'birth': 'islands#redIcon', 'death': 'islands#blackIcon',
        'battle': 'islands#violetIcon', 'construction': 'islands#greenIcon',
        'law': 'islands#blueIcon', 'publication': 'islands#orangeIcon',
        'disaster': 'islands#grayIcon', 'expedition': 'islands#yellowIcon',
        'default': 'islands#greyIcon'
    };

    let allEvents = [];
    let placemarksCollection = new ymaps.GeoObjectCollection(null, {});
    myMap.geoObjects.add(placemarksCollection);

    const yearSlider = document.getElementById('year-slider');
    const startYearDisplay = document.getElementById('start-year');
    const endYearDisplay = document.getElementById('end-year');
    const eventCounter = document.getElementById('event-counter');

    // --- 2. ГЛАВНАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ КАРТЫ ---
    function updateMap(startYear, endYear) {
        placemarksCollection.removeAll();
        const eventsInRange = allEvents.filter(event => event.year >= startYear && event.year <= endYear);
        
        // Проверка, что элемент eventCounter найден, прежде чем его использовать
        if (eventCounter) {
            eventCounter.textContent = `Найдено событий: ${eventsInRange.length}`;
        }

        eventsInRange.forEach(event => {
            const eventColor = (EVENT_COLORS[event.type] || EVENT_COLORS['default']).split('#')[1].slice(0, -4);
            const balloonContent = `
                <div class="custom-balloon">
                    <div class="custom-balloon__title">${event.name}</div>
                    <div class="custom-balloon__type" style="color: ${eventColor};">Тип: ${event.type} (${event.year})</div>
                    <div class="custom-balloon__content">
                        ${event.extract}
                        ${event.wiki_url ? `<hr class="custom-balloon__divider"><a href="${event.wiki_url}" target="_blank">Читать в Википедии</a>` : ''}
                    </div>
                </div>
            `;
            const placemark = new ymaps.Placemark(
                [event.lat, event.lon],
                { balloonContent: balloonContent, hintContent: `${event.name} (${event.year})` }, 
                { preset: EVENT_COLORS[event.type] || EVENT_COLORS['default'] }
            );
            placemarksCollection.add(placemark);
        });
    }

    // --- 3. ЗАГРУЗКА ДАННЫХ И ИНИЦИАЛИЗАЦИЯ СЛАЙДЕРА ---
    fetch(DATA_URL)
        .then(response => response.json())
        .then(data => {
            allEvents = data;
            console.log(`Данные успешно загружены. Всего событий: ${allEvents.length}`);
            
            const minYear = Math.min(...allEvents.map(e => e.year).filter(y => y > 0)); // Фильтруем некорректные годы
            const maxYear = Math.max(...allEvents.map(e => e.year));

            // Проверяем, что слайдер на странице есть, прежде чем его инициализировать
            if (!yearSlider) {
                console.error("HTML-элемент для слайдера #year-slider не найден!");
                return;
            }

            noUiSlider.create(yearSlider, {
                start: [minYear, Math.min(minYear + 25, maxYear)],
                connect: true,
                step: 1,
                range: { 'min': minYear, 'max': maxYear },
                format: { to: value => Math.round(value), from: value => Number(value) }
            });

            yearSlider.noUiSlider.on('update', (values) => {
                const [startYear, endYear] = values;
                // Проверяем, что элементы для отображения дат найдены
                if (startYearDisplay) startYearDisplay.textContent = startYear;
                if (endYearDisplay) endYearDisplay.textContent = endYear;
                updateMap(startYear, endYear);
            });
        })
        .catch(error => {
            console.error('Критическая ошибка:', error);
            if (document.getElementById('map')) {
                 document.getElementById('map').innerHTML = `<div style="padding: 20px; text-align: center; color: red;">Ошибка в работе скрипта. Проверьте консоль (F12).</div>`;
            }
        });
}