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
      },
      common: {
        loading: 'Загрузка...',
        errorTitle: 'Ошибка',
        ok: 'ОК',
        cancel: 'Отмена',
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
      },
      common: {
        loading: 'Loading...',
        errorTitle: 'Error',
        ok: 'OK',
        cancel: 'Cancel',
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

