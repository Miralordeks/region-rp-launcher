import logo from '../assets/logo.png'
import '../styles/titlebar.css'

type Props = {
  onMinimize: () => void
  onMaximize: () => void
  onClose: () => void
  onSettings: () => void
}

export function TitleBar({
  onMinimize,
  onMaximize,
  onClose,
  onSettings,
}: Props) {
  return (
    <header className="titlebar">
      <div className="titlebar__brand">
        <img
          className="titlebar__logo"
          src={logo}
          alt=""
          width={24}
          height={24}
          draggable={false}
        />
        Region RP Launcher
      </div>
      <div className="titlebar__controls">
        <button
          type="button"
          className="titlebar__btn"
          aria-label="Настройки"
          onClick={onSettings}
        >
          <svg className="titlebar__icon" viewBox="0 0 12 12" aria-hidden>
            <path
              d="M5 1.2h2l.3 1.2a3.6 3.6 0 0 1 1 .6l1.2-.4.9 1.6-1 .8c.1.3.1.6 0 .9l1 .8-.9 1.6-1.2-.4a3.6 3.6 0 0 1-1 .6L7 10.8H5l-.3-1.2a3.6 3.6 0 0 1-1-.6l-1.2.4L1.6 7.8l1-.8a3.2 3.2 0 0 1 0-.9l-1-.8.9-1.6 1.2.4a3.6 3.6 0 0 1 1-.6L5 1.2Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.1"
            />
            <circle cx="6" cy="6" r="1.4" fill="currentColor" />
          </svg>
        </button>
        <button
          type="button"
          className="titlebar__btn"
          aria-label="Свернуть"
          onClick={onMinimize}
        >
          <svg className="titlebar__icon" viewBox="0 0 12 12" aria-hidden>
            <path d="M2 6h8" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
        <button
          type="button"
          className="titlebar__btn"
          aria-label="Развернуть"
          onClick={onMaximize}
        >
          <svg className="titlebar__icon" viewBox="0 0 12 12" aria-hidden>
            <rect
              x="2.2"
              y="2.2"
              width="7.6"
              height="7.6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
            />
          </svg>
        </button>
        <button
          type="button"
          className="titlebar__btn titlebar__btn--close"
          aria-label="Закрыть"
          onClick={onClose}
        >
          <svg className="titlebar__icon" viewBox="0 0 12 12" aria-hidden>
            <path
              d="M3 3l6 6M9 3L3 9"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
        </button>
      </div>
    </header>
  )
}
