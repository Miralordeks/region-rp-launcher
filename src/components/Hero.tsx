import logo from '../assets/logo.png'
import type { LauncherLinks } from '../../electron/types'
import '../styles/hero.css'

type Props = {
  launching: boolean
  error: string | null
  onlinePlayers: number
  links: LauncherLinks
  onLaunch: () => void
  onOpenLink: (url: string) => void
}

export function Hero({
  launching,
  error,
  onlinePlayers,
  links,
  onLaunch,
  onOpenLink,
}: Props) {
  return (
    <section className={`hero${launching ? ' is-launching' : ''}`}>
      <div className="hero__logo-wrap">
        <img
          className="hero__logo"
          src={logo}
          alt="Region RP"
          width={168}
          height={168}
          draggable={false}
        />
      </div>
      <h1 className="hero__brand">Region RP</h1>
      <p className="hero__headline">Город живёт. Дороги зовут.</p>
      <p className="hero__lead">
        Лаунчер официального RP-проекта: один клик — и ты уже на сервере.
      </p>

      <div className="online">
        <span className="online__dot" />
        <span className="online__label">Онлайн</span>
        <strong className="online__count">{onlinePlayers}</strong>
      </div>

      <div className="hero__actions">
        <button
          type="button"
          className="launch"
          onClick={onLaunch}
          disabled={launching}
        >
          <svg className="launch__icon" viewBox="0 0 24 24" aria-hidden>
            <path fill="currentColor" d="M8 5.14v13.72L19 12 8 5.14z" />
          </svg>
          {launching ? 'Запуск…' : 'Играть'}
        </button>

        <div className="launch-meta">
          <strong>Roblox Player</strong>
          <span>Автоматический вход на сервер</span>
        </div>
      </div>

      <div className="link-row">
        <button
          type="button"
          className="link-btn"
          onClick={() => onOpenLink(links.discord)}
        >
          Discord
        </button>
        <button
          type="button"
          className="link-btn"
          onClick={() => onOpenLink(links.website)}
        >
          Сайт
        </button>
        <button
          type="button"
          className="link-btn"
          onClick={() => onOpenLink(links.rules)}
        >
          Правила
        </button>
      </div>

      {error ? <div className="toast">{error}</div> : null}
    </section>
  )
}
