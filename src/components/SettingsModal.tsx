import type { UpdateStatus, UserSettings } from '../../electron/types'
import '../styles/settings.css'

type Props = {
  open: boolean
  settings: UserSettings
  version: string
  updateStatus: UpdateStatus
  onClose: () => void
  onChange: (partial: Partial<UserSettings>) => void
  onCheckUpdates: () => void
  onInstallUpdate: () => void
}

function updateLabel(status: UpdateStatus): string {
  switch (status.status) {
    case 'checking':
      return 'Проверка обновлений…'
    case 'available':
      return `Доступна версия ${status.version}`
    case 'downloading':
      return `Скачивание… ${status.percent}%`
    case 'downloaded':
      return `Обновление ${status.version} готово`
    case 'not-available':
      return 'Установлена последняя версия'
    case 'disabled':
      return status.message
    case 'error':
      return status.message
    default:
      return 'Автообновление'
  }
}

export function SettingsModal({
  open,
  settings,
  version,
  updateStatus,
  onClose,
  onChange,
  onCheckUpdates,
  onInstallUpdate,
}: Props) {
  if (!open) return null

  return (
    <div className="settings-backdrop" role="presentation" onClick={onClose}>
      <div
        className="settings"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="settings__header">
          <div>
            <p className="settings__eyebrow">Лаунчер</p>
            <h2 id="settings-title" className="settings__title">
              Настройки
            </h2>
          </div>
          <button
            type="button"
            className="settings__close"
            aria-label="Закрыть"
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        <div className="settings__list">
          <label className="settings__row">
            <div>
              <strong>Автозапуск с Windows</strong>
              <span>Открывать лаунчер при входе в систему</span>
            </div>
            <input
              type="checkbox"
              checked={settings.openAtLogin}
              onChange={(event) =>
                onChange({ openAtLogin: event.target.checked })
              }
            />
          </label>

          <label className="settings__row">
            <div>
              <strong>Сворачивать в трей</strong>
              <span>Закрытие и «−» прячут окно в системный трей</span>
            </div>
            <input
              type="checkbox"
              checked={settings.minimizeToTray}
              onChange={(event) =>
                onChange({ minimizeToTray: event.target.checked })
              }
            />
          </label>
        </div>

        <div className="settings__update">
          <div>
            <strong>Обновления</strong>
            <span>{updateLabel(updateStatus)}</span>
          </div>
          <div className="settings__update-actions">
            <button type="button" className="settings__btn" onClick={onCheckUpdates}>
              Проверить
            </button>
            {updateStatus.status === 'downloaded' ? (
              <button
                type="button"
                className="settings__btn settings__btn--accent"
                onClick={onInstallUpdate}
              >
                Установить
              </button>
            ) : null}
          </div>
        </div>

        <footer className="settings__footer">Версия {version}</footer>
      </div>
    </div>
  )
}
