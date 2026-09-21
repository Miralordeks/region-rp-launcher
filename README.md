# Region RP Launcher

Десктоп-лаунчер **Region RP** на Electron / Node.js (без Python).

## Возможности

- Запуск Roblox на сервер игры
- Новости и обновления
- Discord Rich Presence + логотип
- Кнопки Discord / Сайт / Правила
- Онлайн игроков (пока `0`)
- Настройки: автозапуск Windows, сворачивание в трей
- Автообновление лаунчера
- Звук и анимация при нажатии «Играть»

## Разработка

```bash
npm install
npm run dev
```

## Сборка EXE

```bash
npm run dist
```

Файлы появятся в `out-win/`.

## Конфиг

`launcher.config.json`:

```json
{
  "placeId": "1234567890",
  "discordClientId": "1551328944555429970",
  "gameName": "Регион РП",
  "links": {
    "discord": "https://discord.gg/GhNc7TqsUe",
    "website": "https://discord.gg/GhNc7TqsUe",
    "rules": "https://discord.gg/GhNc7TqsUe"
  },
  "updateFeedUrl": "https://your-cdn.com/region-rp-updates",
  "onlinePlayers": 0
}
```

### Автообновление

1. Укажи `updateFeedUrl` — URL папки, где лежат `latest.yml` и установщики после `electron-builder`
2. Залей туда артефакты сборки (`Region RP Setup x.x.x.exe`, `latest.yml`, blockmap)
3. Лаунчер сам проверит обновления при старте (в packed-сборке)

Пока `updateFeedUrl` пустой — автообновление выключено, в настройках можно нажать «Проверить».

### Discord Presence

1. Приложение **Регион РП** в Developer Portal
2. Art Assets → загрузить `discord-assets/logo.png` с именем **`logo`**
