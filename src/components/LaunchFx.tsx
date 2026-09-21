import '../styles/launch-fx.css'

type Props = {
  active: boolean
}

export function LaunchFx({ active }: Props) {
  if (!active) return null

  return (
    <div className="launch-fx" aria-hidden>
      <div className="launch-fx__flash" />
      <div className="launch-fx__ring" />
      <div className="launch-fx__ring launch-fx__ring--delay" />
      <div className="launch-fx__scan" />
      <p className="launch-fx__label">Запуск Region RP…</p>
    </div>
  )
}
