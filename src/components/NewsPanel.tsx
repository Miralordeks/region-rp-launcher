import { useState } from 'react'
import { newsFeed, type NewsItem } from '../data/news'
import '../styles/news.css'

function formatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function NewsPanel() {
  const [activeId, setActiveId] = useState(newsFeed[0]?.id ?? '')

  return (
    <aside className="news">
      <header className="news__header">
        <p className="news__eyebrow">Лента проекта</p>
        <h2 className="news__title">Новости и обновления</h2>
      </header>

      <div className="news__list" role="list">
        {newsFeed.map((item: NewsItem) => (
          <button
            key={item.id}
            type="button"
            role="listitem"
            className={`news-item${activeId === item.id ? ' is-active' : ''}`}
            onClick={() => setActiveId(item.id)}
          >
            <div className="news-item__meta">
              <span className="news-item__tag">{item.tag}</span>
              <time className="news-item__date" dateTime={item.date}>
                {formatDate(item.date)}
              </time>
            </div>
            <h3 className="news-item__title">{item.title}</h3>
            <p className="news-item__body">{item.body}</p>
          </button>
        ))}
      </div>

      <footer className="news__footer">
        Region RP · сезон весна 2026
      </footer>
    </aside>
  )
}
