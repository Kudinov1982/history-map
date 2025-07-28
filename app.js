// Ждем, пока загрузится API Яндекс.Карт
ymaps.ready(init);

function init() {
    // --- 1. НАСТРОЙКИ И ИНИЦИАЛИЗАЦИЯ ---
    const myMap = new ymaps.Map('map', { center: [58, 65], zoom: 4, controls: ['zoomControl'] });
    const DATA_URL = 'https://cdn.jsdelivr.net/gh/Kudinov1982/history-map/historical_events_MAX.json';

    // --- НОВОЕ: Конфигурация кастомных SVG-иконок ---
    // Здесь мы храним SVG-код для каждой иконки и ее цвет
    const EVENT_ICONS = {
        'birth': {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#D8334A" class="bi bi-cake2" viewBox="0 0 16 16"><path d="m3.494.013-.595.79A.747.747 0 0 0 3 1.814v2.683q-.224.051-.432.107c-.702.187-1.305.418-1.745.696C.408 5.56 0 5.954 0 6.5v7c0 .546.408.94.823 1.201.44.278 1.043.51 1.745.696C3.978 15.773 5.898 16 8 16s4.022-.227 5.432-.603c.701-.187 1.305-.418 1.745-.696.415-.261.823-.655.823-1.201v-7c0-.546-.408-.94-.823-1.201-.44-.278-1.043-.51-1.745-.696A12 12 0 0 0 13 4.496v-2.69a.747.747 0 0 0 .092-1.004l-.598-.79-.595.792A.747.747 0 0 0 12 1.813V4.3a22 22 0 0 0-2-.23V1.806a.747.747 0 0 0 .092-1.004l-.598-.79-.595.792A.747.747 0 0 0 9 1.813v2.204a29 29 0 0 0-2 0V1.806A.747.747 0 0 0 7.092.802l-.598-.79-.595.792A.747.747 0 0 0 6 1.813V4.07c-.71.05-1.383.129-2 .23V1.806A.747.747 0 0 0 4.092.802zm-.668 5.556L3 5.524v.967q.468.111 1 .201V5.315a21 21 0 0 1 2-.242v1.855q.488.036 1 .054V5.018a28 28 0 0 1 2 0v1.964q.512-.018 1-.054V5.073c.72.054 1.393.137 2 .242v1.377q.532-.09 1-.201v-.967l.175.045c.655.175 1.15.374 1.469.575.344.217.356.35.356.356s-.012.139-.356.356c-.319.2-.814.4-1.47.575C11.87 7.78 10.041 8 8 8c-2.04 0-3.87-.221-5.174-.569-.656-.175-1.151-.374-1.47-.575C1.012 6.639 1 6.506 1 6.5s.012-.139.356-.356c.319-.2.814-.4 1.47-.575M15 7.806v1.027l-.68.907a.94.94 0 0 1-1.17.276 1.94 1.94 0 0 0-2.236.363l-.348.348a1 1 0 0 1-1.307.092l-.06-.044a2 2 0 0 0-2.399 0l-.06.044a1 1 0 0 1-1.306-.092l-.35-.35a1.935 1.935 0 0 0-2.233-.362.935.935 0 0 1-1.168-.277L1 8.82V7.806c.42.232.956.428 1.568.591C3.978 8.773 5.898 9 8 9s4.022-.227 5.432-.603c.612-.163 1.149-.36 1.568-.591m0 2.679V13.5c0 .006-.012.139-.356.355-.319.202-.814.401-1.47.576C11.87 14.78 10.041 15 8 15c-2.04 0-3.87-.221-5.174-.569-.656-.175-1.151-.374-1.47-.575-.344-.217-.356-.35-.356-.356v-3.02a1.935 1.935 0 0 0 2.298.43.935.935 0 0 1 1.08.175l.348.349a2 2 0 0 0 2.615.185l.059-.044a1 1 0 0 1 1.2 0l.06.044a2 2 0 0 0 2.613-.185l.348-.348a.94.94 0 0 1 1.082-.175c.781.39 1.718.208 2.297-.426"/></svg>',
            color: '#D8334A' // Красный
        },
        'death': {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#333333" viewBox="0 0 32 32"><path d="M21,13V9a1,1,0,0,0-1-1H12a1,1,0,0,0-1,1v4a1,1,0,0,0,1,1h8A1,1,0,0,0,21,13ZM13,13V10h6v3Z"></path><path d="M25.83,16.42,23,14.14V5a3,3,0,0,0-3-3H12a3,3,0,0,0-3,3v9.14l-2.83,2.28A3,3,0,0,0,5,19v9a3,3,0,0,0,3,3H24a3,3,0,0,0,3-3V19A3,3,0,0,0,25.83,16.42ZM11,5a1,1,0,0,1,1-1h8a1,1,0,0,1,1,1v8.42l-2.29,1.83a1,1,0,0,0-.42,1.26,1,1,0,0,0,1.27.42L21,15.86V21H11V15.86l2.44-1.05a1,1,0,0,0,.42-1.26A1,1,0,0,0,13.29,13L11,14.42ZM25,28a1,1,0,0,1-1,1H8a1,1,0,0,1-1-1V19a1,1,0,0,1,.28-.68l2-1.57,0,7.52a1,1,0,0,0,1,1h8a1,1,0,0,0,1-1V16.75l2-1.57A1,1,0,0,1,25,16Z"></path></svg>',
            color: '#333333' // Черный
        },
        'battle': {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#8E44AD" viewBox="0 0 24 24"><path d="M19.7,7.69,15,4.4V4a2,2,0,0,0-2-2H9A2,2,0,0,0,7,4v.4L2.3,7.69a1.5,1.5,0,0,0-.56,1.75l2,5.2A1.5,1.5,0,0,0,5.15,15.5H5.5v4A2.5,2.5,0,0,0,8,22h2a2.5,2.5,0,0,0,2.5-2.5v-4h.35a1.5,1.5,0,0,0,1.41-.86l2-5.2A1.5,1.5,0,0,0,19.7,7.69ZM9,4h6V5.5H9ZM12.5,19.5a.5.5,0,0,1-.5.5H8a.5.5,0,0,1-.5-.5v-4h5Zm4.17-5.38-2,5.2a.5.5,0,0,1-.47.28h-.55V15a1,1,0,0,0-1-1H7.35a1,1,0,0,0-1,1v.3h-.55a.5.5,0,0,1-.47-.28l-2-5.2a.5.5,0,0,1,.19-.58L8.13,6h7.74l4.61,3.24A.5.5,0,0,1,16.67,14.12Z"></path></svg>',
            color: '#8E44AD' // Фиолетовый
        },
        // Стандартные иконки для остальных типов
        'construction': { color: 'green' }, 'law': { color: 'blue' }, 'publication': { color: 'orange' },
        'disaster': { color: 'gray' }, 'expedition': { color: 'yellow' },
        'default': { color: 'grey' }
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
        if (eventCounter) eventCounter.textContent = `Найдено событий: ${eventsInRange.length}`;

        eventsInRange.forEach(event => {
            const iconConfig = EVENT_ICONS[event.type] || EVENT_ICONS['default'];
            const balloonContent = `...`; // Содержимое балуна остается тем же
            
            // --- НОВОЕ: Логика создания иконки ---
            let placemarkOptions = {};
            if (iconConfig.svg) {
                // Если у нас есть SVG, создаем кастомный макет
                const svgIconLayout = ymaps.templateLayoutFactory.createClass(
                    `<div style="background-color: white; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
                        ${iconConfig.svg}
                    </div>`
                );
                placemarkOptions = {
                    iconLayout: svgIconLayout,
                    // Фигура активной области (для кликов) - круг
                    iconShape: { type: 'Circle', coordinates: [12, 12], radius: 12 }
                };
            } else {
                // Иначе используем стандартную цветную иконку
                placemarkOptions = { preset: `islands#${iconConfig.color}Icon` };
            }

            const placemark = new ymaps.Placemark(
                [event.lat, event.lon],
                { balloonContent: balloonContent, hintContent: `${event.name} (${event.year})` }, 
                placemarkOptions
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
            
            const years = allEvents.map(e => e.year).filter(y => y > 1000 && y < 3000); // Отсеиваем мусорные даты
            const minYear = Math.min(...years);
            const maxYear = Math.max(...years);

            if (!yearSlider) {
                console.error("HTML-элемент для слайдера #year-slider не найден!");
                return;
            }

            noUiSlider.create(yearSlider, {
                start: [minYear, Math.min(minYear + 25, maxYear)],
                connect: true, step: 1,
                range: { 'min': minYear, 'max': maxYear },
                format: { to: value => Math.round(value), from: value => Number(value) }
            });

            yearSlider.noUiSlider.on('update', (values) => {
                const [startYear, endYear] = values;
                if (startYearDisplay) startYearDisplay.textContent = startYear;
                if (endYearDisplay) endYearDisplay.textContent = endYear;
                updateMap(startYear, endYear);
            });
        })
        .catch(error => console.error('Критическая ошибка:', error));
}```

#### **Действие 2: Обновите код в HTML-блоке на Tilda**

Нам нужно обновить легенду, чтобы она соответствовала нашим новым иконкам.

```html
<!-- 1. ПОДКЛЮЧАЕМ API И БИБЛИОТЕКИ (без изменений) -->
<script src="https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=e0d7a257-2726-4d05-8249-de25c39d8e82" type="text/javascript"></script>
<link href="https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/15.7.1/nouislider.min.css" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/15.7.1/nouislider.min.js"></script>

<!-- 2. СТИЛИ ДЛЯ ОФОРМЛЕНИЯ -->
<style>
/* ... все стили остаются прежними, кроме легенды ... */
.legend-item svg { width: 24px; height: 24px; margin-right: 8px; }
/* ... остальные стили ... */
</style>

<!-- 3. HTML-СТРУКТУРА ПРИЛОЖЕНИЯ -->
<div class="map-app-container">
    <!-- ... блок .controls остается без изменений ... -->
    <div class="map-wrapper">
        <div id="map"></div>
        <!-- НОВОЕ: Обновленная легенда с SVG-иконками -->
        <div class="legend">
            <h4>Легенда</h4>
            <div class="legend-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#D8334A" viewBox="0 0 16 16">...</svg>
                <span>Рождение</span>
            </div>
            <div class="legend-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#333333" viewBox="0 0 32 32">...</svg>
                <span>Смерть</span>
            </div>
            <div class="legend-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#8E44AD" viewBox="0 0 24 24">...</svg>
                <span>Сражение</span>
            </div>
            <!-- Для остальных используем стандартные кружки -->
            <div class="legend-item"><div style="width:16px; height:16px; background-color:green; border-radius:50%; margin-right:8px;"></div><span>Строительство</span></div>
            <div class="legend-item"><div style="width:16px; height:16px; background-color:blue; border-radius:50%; margin-right:8px;"></div><span>Закон/Договор</span></div>
            <div class="legend-item"><div style="width:16px; height:16px; background-color:orange; border-radius:50%; margin-right:8px;"></div><span>Публикация</span></div>
        </div>
    </div>
</div>

<!-- 4. ПОДКЛЮЧАЕМ ВАШ СКРИПТ (с новой версией) -->
<script src="https://cdn.jsdelivr.net/gh/Kudinov1982/history-map/app.js?v=custom_icons"></script>