import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'gonext_language';

const resources = {
  ru: {
    translation: {
      home: {
        greeting: 'Приветствую, Иван!',
        places: 'Места',
        trips: 'Поездки',
        nextPlace: 'Следующее место',
        highlights: 'Достопримечательности',
        settings: 'Настройки',
      },
      places: {
        titleList: 'Места',
        emptyTitle: 'Пока нет ни одного места',
        emptyText: 'Нажми на кнопку «+», чтобы добавить первое место в свой дневник.',
        newTitle: 'Новое место',
        fieldName: 'Название',
        fieldDescription: 'Описание',
        visitLater: 'Посетить позже',
        visitLaterHelp: 'Отметь, если это место пока в планах и ты ещё туда не добрался.',
        liked: 'Понравилось',
        likedHelp: 'Отметь, если это одно из любимых мест, к которым особенно хочется вернуться.',
        latitude: 'Широта (lat)',
        longitude: 'Долгота (lon)',
        photos: 'Фотографии',
        addPhoto: 'Добавить фото',
        save: 'Сохранить',
        detailsTitle: 'Место',
        deletePlace: 'Удалить место',
        openInMaps: 'Открыть в навигаторе',
        errorTitleRequired: 'Ошибка',
        errorNameRequired: 'Название места обязательно.',
      },
      trips: {
        titleList: 'Поездки',
        emptyTitle: 'Пока нет ни одной поездки',
        emptyText: 'Нажми на «+», чтобы спланировать своё первое путешествие.',
        newTitle: 'Новая поездка',
        fieldName: 'Название',
        fieldDescription: 'Описание',
        startDate: 'Дата начала (например, 2025-06-01)',
        endDate: 'Дата окончания (например, 2025-06-10)',
        currentFlag: 'Сделать текущей поездкой',
        saveTrip: 'Сохранить поездку',
      },
      highlights: {
        titleList: 'Достопримечательности',
        emptyTitle: 'Пока нет ни одной записи',
        emptyText: 'Нажми на «+», чтобы сохранить первую яркую достопримечательность или момент.',
        filterCurrentTripPrefix: 'Текущая поездка: {{title}}',
        filterNoCurrentTrip: 'Нет текущей поездки',
        filterAll: 'Все',
        newTitle: 'Новая достопримечательность',
        tripInfoWithTrip: 'Текущая поездка: {{title}}',
        tripInfoNoTrip: 'Текущая поездка не выбрана.',
        fieldTitle: 'Название',
        fieldDescription: 'Описание / заметка',
        fieldDate: 'Дата и время (ISO, можно отредактировать)',
        photos: 'Фотографии',
        addPhoto: 'Добавить фото',
        saveHighlight: 'Сохранить запись',
        detailsTitle: 'Достопримечательность',
        metaDate: 'Дата/время: {{value}}',
        metaTrip: 'Поездка: {{title}}',
        metaPlace: 'Место: {{title}}',
        descriptionFallback: 'Без описания. Заметка не заполнена.',
        deleteTitle: 'Удалить запись',
        deleteConfirm: 'Точно удалить эту запись?',
        errorTitleRequired: 'Ошибка',
        errorNameRequired: 'Название обязательно.',
        errorLoadList: 'Не удалось загрузить достопримечательности.',
        errorSave: 'Не удалось сохранить запись. Проверь логи консоли.',
        errorLoadDetails: 'Не удалось загрузить данные.',
        errorDelete: 'Не удалось удалить запись.',
        noPhotoPermission: 'Нужен доступ к фото, чтобы прикреплять изображения.',
      },
      nextPlace: {
        title: 'Следующее место',
        loading: 'Определяем следующую точку маршрута…',
        noTrips: 'Пока нет ни одной поездки. Создай поездку, чтобы увидеть следующее место.',
        noNextPlace: 'В текущей поездке «{{title}}» больше нет непосещённых мест.',
        descriptionFallback: 'Описание не задано.',
        coordsLabel: 'Координаты:',
        coordsNotSet: 'не заданы',
        openInMaps: 'Открыть в навигаторе',
        markVisited: 'Отметить как посещённое и перейти к следующему',
        noCoordsTitle: 'Нет координат',
        noCoordsMessage: 'У этого места пока не заданы координаты.',
        errorTitle: 'Ошибка',
        errorLoad: 'Не удалось загрузить следующее место. Проверь логи консоли.',
        errorOpenMaps: 'Не удалось открыть навигатор.',
        errorMarkVisited: 'Не удалось отметить место посещённым.',
      },
      settings: {
        title: 'Настройки',
        aboutTitle: 'О приложении',
        aboutText:
          'GoNext — дневник путешественника. Приложение работает офлайн и хранит все данные локально на устройстве.',
        themeToggle: 'Переключение темы',
        darkTheme: 'Тёмная тема',
        accentLabel: 'Основной цвет тёмной темы',
        languageTitle: 'Язык интерфейса',
        languageRu: 'Русский',
        languageEn: 'English',
        hintsTitle: 'Короткие подсказки',
        hintsLabel: 'Включить короткие подсказки',
        hintsDescription:
          'Когда режим включён, на экранах будут появляться небольшие поясняющие карточки с подсказками.',
      },
      common: {
        loading: 'Загрузка...',
        errorTitle: 'Ошибка',
        ok: 'ОК',
        cancel: 'Отмена',
      },
      hints: {
        home:
          'Выбери один из режимов — Места, Поездки, Следующее место или Достопримечательности, чтобы начать заполнять дневник.',
        placesList:
          'Здесь будут храниться все сохранённые места. Нажми на «+», чтобы добавить первое место.',
        tripsList:
          'Здесь будут твои поездки. Нажми на «+», чтобы запланировать первую и добавить в неё места.',
        highlightsList:
          'Здесь можно сохранять яркие моменты и достопримечательности. Нажми на «+», чтобы добавить первую запись.',
      },
    },
  },
  en: {
    translation: {
      home: {
        greeting: 'Welcome, Ivan!',
        places: 'Places',
        trips: 'Trips',
        nextPlace: 'Next place',
        highlights: 'Highlights',
        settings: 'Settings',
      },
      places: {
        titleList: 'Places',
        emptyTitle: 'No places yet',
        emptyText: 'Tap "+" to add your first place to the diary.',
        newTitle: 'New place',
        fieldName: 'Name',
        fieldDescription: 'Description',
        visitLater: 'Visit later',
        visitLaterHelp: 'Mark if this place is only planned and not visited yet.',
        liked: 'Liked',
        likedHelp: 'Mark if this is one of your favourite places you want to return to.',
        latitude: 'Latitude (lat)',
        longitude: 'Longitude (lon)',
        photos: 'Photos',
        addPhoto: 'Add photo',
        save: 'Save',
        detailsTitle: 'Place',
        deletePlace: 'Delete place',
        openInMaps: 'Open in maps',
        errorTitleRequired: 'Error',
        errorNameRequired: 'Place name is required.',
      },
      trips: {
        titleList: 'Trips',
        emptyTitle: 'No trips yet',
        emptyText: 'Tap "+" to plan your first trip.',
        newTitle: 'New trip',
        fieldName: 'Title',
        fieldDescription: 'Description',
        startDate: 'Start date (e.g. 2025-06-01)',
        endDate: 'End date (e.g. 2025-06-10)',
        currentFlag: 'Make current trip',
        saveTrip: 'Save trip',
      },
      highlights: {
        titleList: 'Highlights',
        emptyTitle: 'No highlights yet',
        emptyText: 'Tap "+" to save your first memorable highlight or moment.',
        filterCurrentTripPrefix: 'Current trip: {{title}}',
        filterNoCurrentTrip: 'No current trip',
        filterAll: 'All',
        newTitle: 'New highlight',
        tripInfoWithTrip: 'Current trip: {{title}}',
        tripInfoNoTrip: 'Current trip is not selected.',
        fieldTitle: 'Title',
        fieldDescription: 'Description / note',
        fieldDate: 'Date and time (ISO, you can edit)',
        photos: 'Photos',
        addPhoto: 'Add photo',
        saveHighlight: 'Save highlight',
        detailsTitle: 'Highlight',
        metaDate: 'Date/time: {{value}}',
        metaTrip: 'Trip: {{title}}',
        metaPlace: 'Place: {{title}}',
        descriptionFallback: 'No description. Note is empty.',
        deleteTitle: 'Delete highlight',
        deleteConfirm: 'Are you sure you want to delete this highlight?',
        errorTitleRequired: 'Error',
        errorNameRequired: 'Title is required.',
        errorLoadList: 'Failed to load highlights.',
        errorSave: 'Failed to save highlight. Check console logs.',
        errorLoadDetails: 'Failed to load data.',
        errorDelete: 'Failed to delete highlight.',
        noPhotoPermission: 'Photo access is required to attach images.',
      },
      nextPlace: {
        title: 'Next place',
        loading: 'Looking for the next point of your route…',
        noTrips: 'There are no trips yet. Create a trip to see the next place.',
        noNextPlace: 'There are no unvisited places left in the trip "{{title}}".',
        descriptionFallback: 'No description.',
        coordsLabel: 'Coordinates:',
        coordsNotSet: 'not set',
        openInMaps: 'Open in maps',
        markVisited: 'Mark as visited and go to the next one',
        noCoordsTitle: 'No coordinates',
        noCoordsMessage: 'This place has no coordinates yet.',
        errorTitle: 'Error',
        errorLoad: 'Failed to load the next place. Check console logs.',
        errorOpenMaps: 'Failed to open navigation app.',
        errorMarkVisited: 'Failed to mark the place as visited.',
      },
      settings: {
        title: 'Settings',
        aboutTitle: 'About app',
        aboutText:
          'GoNext is a traveller diary. The app works offline and keeps all data locally on the device.',
        themeToggle: 'Theme toggle',
        darkTheme: 'Dark theme',
        accentLabel: 'Primary color for dark theme',
        languageTitle: 'Interface language',
        languageRu: 'Russian',
        languageEn: 'English',
        hintsTitle: 'Short hints',
        hintsLabel: 'Enable short hints',
        hintsDescription:
          'When this mode is on, small explanatory hint cards will appear on the screens.',
      },
      common: {
        loading: 'Loading...',
        errorTitle: 'Error',
        ok: 'OK',
        cancel: 'Cancel',
      },
      hints: {
        home:
          'Choose one of the modes — Places, Trips, Next place or Highlights — to start filling your diary.',
        placesList:
          'This is where all saved places will be stored. Tap "+" to add your first place.',
        tripsList:
          'This is where your trips live. Tap "+" to plan your first trip and add places into it.',
        highlightsList:
          'Here you can save memorable moments and highlights. Tap "+" to add your first highlight.',
      },
    },
  },
};

let initialized = false;

export async function initI18n() {
  if (initialized) return;

  const storedLang = await AsyncStorage.getItem(STORAGE_KEY);
  const lng = storedLang || 'ru';

  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng,
      fallbackLng: 'ru',
      compatibilityJSON: 'v3',
      interpolation: {
        escapeValue: false,
      },
    });

  initialized = true;
}

export async function changeAppLanguage(lang: 'ru' | 'en') {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem(STORAGE_KEY, lang);
}

export { i18n };

