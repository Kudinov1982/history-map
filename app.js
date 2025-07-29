// Ждем, пока загрузится API Яндекс.Карт
ymaps.ready(init);

function init() {
    // --- 1. НАСТРОЙКИ И ИНИЦИАЛИЗАЦИЯ ---
    const myMap = new ymaps.Map('map', { center: [58, 65], zoom: 4, controls: ['zoomControl'] });
    const DATA_URL = 'https://cdn.jsdelivr.net/gh/Kudinov1982/history-map/historical_events_MAX.json';
    
    // Новая, более подробная конфигурация. Добавляем названия для интерфейса.
    const EVENT_TYPE_CONFIG = {
        'birth': { name: 'Рождения', svg: '<svg ...>', color: '#D8334A' }, // Вставьте SVG для торта
        'death': { name: 'Смерти', svg: '<svg ...>', color: '#333333' }, // Вставьте SVG для надгробия
        'battle': { name: 'Сражения', svg: '<svg ...>', color: '#8E44AD' }, // Вставьте SVG для битвы
        'construction': { name: 'Строительство', color: 'green' },
        'law': { name: 'Законы/Договоры', color: 'blue' },
        'publication': { name: 'Публикации', color: 'orange' },
        'disaster': { name: 'Происшествия', color: 'gray' },
        'expedition': { name: 'Экспедиции', color: 'yellow' },
        'default': { name: 'Прочее', color: 'grey' }
    };
    
    let allEvents = [];
    let placemarks = []; // Будем хранить здесь метки для связи со списком
    let placemarksCollection = new ymaps.GeoObjectCollection(null, {});
    myMap.geoObjects.add(placemarksCollection);

    // Находим новые элементы на странице
    const yearSlider = document.getElementById('year-slider');
    const startYearDisplay = document.getElementById('start-year-display');
    const endYearDisplay = document.getElementById('end-year-display');
    const currentYearDisplay = document.getElementById('current-year-display');
    const eventCounter = document.getElementById('event-counter');
    const typeFiltersContainer = document.getElementById('type-filters');
    const eventListContainer = document.getElementById('event-list');
    
    // --- 2. ФУНКЦИИ-ПОМОЩНИКИ ---

    // Функция для создания фильтров-чекбоксов
    function renderFilters() {
        typeFiltersContainer.innerHTML = '';
        for (const type in EVENT_TYPE_CONFIG) {
            if (type === 'default') continue;
            const config = EVENT_TYPE_CONFIG[type];
            const filterHtml = `
                <div class="filter-item">
                    <input type="checkbox" id="filter-${type}" value="${type}" checked>
                    <label for="filter-${type}">${config.name}</label>
                </div>
            `;
            typeFiltersContainer.innerHTML += filterHtml;
        }
        // Добавляем обработчики событий на все новые чекбоксы
        typeFiltersContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', updateUI);
        });
    }

    // --- 3. ГЛАВНЫЕ ФУНКЦИИ ОБНОВЛЕНИЯ ИНТЕРФЕЙСА ---

    // Главная функция, которая вызывается при любом изменении
    function updateUI() {
        const [startYear, endYear] = yearSlider.noUiSlider.get(true);
        const activeTypes = Array.from(typeFiltersContainer.querySelectorAll('input:checked')).map(cb => cb.value);
        
        // Фильтруем события по дате и по типу
        const filteredEvents = allEvents.filter(event => {
            return event.year >= startYear && event.year <= endYear && activeTypes.includes(event.type);
        });
        
        updateMap(filteredEvents);
        updateSidebarList(filteredEvents);
        updateDateDisplay(startYear, endYear);
    }
    
    function updateMap(events) {
        placemarksCollection.removeAll();
        placemarks = []; // Очищаем массив меток

        events.forEach((event, index) => {
            const iconConfig = EVENT_TYPE_CONFIG[event.type] || EVENT_TYPE_CONFIG['default'];
            const balloonContent = `...`; // Содержимое балуна
            
            let placemarkOptions = {};
            if (iconConfig.svg) {
                const svgIconLayout = ymaps.templateLayoutFactory.createClass(
                    `<div class="custom-svg-icon" style="background-color: white;">${iconConfig.svg}</div>`
                );
                placemarkOptions = {
                    iconLayout: svgIconLayout,
                    iconShape: { type: 'Circle', coordinates: [14, 14], radius: 14 }
                };
            } else {
                placemarkOptions = { preset: `islands#${iconConfig.color}Icon` };
            }

            const placemark = new ymaps.Placemark(
                [event.lat, event.lon],
                { balloonContent: balloonContent, hintContent: `${event.name} (${event.year})` }, 
                placemarkOptions
            );
            
            placemarks[index] = placemark; // Сохраняем метку
            placemarksCollection.add(placemark);
        });
    }

    function updateSidebarList(events) {
        eventListContainer.innerHTML = '';
        if (events.length === 0) {
            eventListContainer.innerHTML = '<div class="event-item-empty">Событий не найдено.</div>';
            return;
        }
        
        // Сортируем события по году для красивого вывода
        events.sort((a, b) => a.year - b.year);
        
        events.forEach((event, index) => {
            const item = document.createElement('div');
            item.className = 'event-item';
            item.innerHTML = `
                <div class="event-item-year">${event.year}</div>
                <div class="event-item-name">${event.name}</div>
                <div class="event-item-location">${event.location}</div>
            `;
            // При клике на элемент списка - перемещаемся к метке на карте
            item.addEventListener('click', () => {
                const placemark = placemarks[index];
                if (placemark) {
                    myMap.panTo(placemark.geometry.getCoordinates(), { duration: 500 }).then(() => {
                        placemark.balloon.open();
                    });
                }
            });
            eventListContainer.appendChild(item);
        });
    }
    
    function updateDateDisplay(start, end) {
        if (start === end) {
            // Режим одного года
            startYearDisplay.style.display = 'none';
            endYearDisplay.style.display = 'none';
            currentYearDisplay.style.display = 'block';
            currentYearDisplay.textContent = `Год: ${start}`;
        } else {
            // Режим диапазона
            startYearDisplay.style.display = 'block';
            endYearDisplay.style.display = 'block';
            currentYearDisplay.style.display = 'none';
            startYearDisplay.textContent = start;
            endYearDisplay.textContent = end;
        }
    }
    
    // --- 4. ЗАГРУЗКА ДАННЫХ И ПЕРВЫЙ ЗАПУСК ---
    fetch(DATA_URL)
        .then(response => response.json())
        .then(data => {
            allEvents = data;
            
            const years = allEvents.map(e => e.year).filter(y => y > 1000 && y < 3000);
            const minYear = Math.min(...years);
            const maxYear = Math.max(...years);

            renderFilters(); // Создаем чекбоксы

            noUiSlider.create(yearSlider, {
                start: [1700, 1725],
                connect: true, step: 1,
                range: { 'min': minYear, 'max': maxYear },
                format: { to: value => Math.round(value), from: value => Number(value) }
            });

            // При любом изменении слайдера вызываем главную функцию обновления
            yearSlider.noUiSlider.on('update', updateUI);
            
            updateUI(); // Первый запуск для отрисовки начального состояния
        })
        .catch(error => console.error('Критическая ошибка:', error));
}