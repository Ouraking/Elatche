import { useState } from 'react';
import { VIDEOS } from '../data';
import type { Video } from '../types';

/**
 * Deferred embedding: each card renders only the YouTube thumbnail until
 * clicked, then swaps in the privacy-enhanced iframe with autoplay. No iframe
 * weight is paid on page load.
 */
function VideoCard({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);

  return (
    <article className="card group overflow-hidden transition-transform duration-500 ease-(--ease-spring) hover:-translate-y-0.5">
      <div className="relative aspect-video w-full bg-black">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0&modestbranding=1&autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="absolute inset-0 cursor-pointer"
            aria-label={`Play: ${video.title}`}
          >
            <img
              loading="lazy"
              src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
              alt=""
              className="h-full w-full object-cover opacity-85 transition-opacity group-hover:opacity-100"
            />
            <span className="pointer-events-none absolute inset-0 grid place-items-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-black/55 text-white ring-1 ring-white/25 backdrop-blur-sm transition-all duration-500 ease-(--ease-spring) group-hover:scale-110 group-hover:bg-accent">
                <svg className="h-6 w-6 translate-x-[1px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-strong">{video.title}</p>
          <p className="truncate text-xs text-muted">{video.author}</p>
        </div>
        <a
          href={`https://www.youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Open on YouTube"
          className="press shrink-0 rounded-lg border border-hairline-strong px-2.5 py-1.5 text-xs font-semibold text-fg hover:border-accent/50 hover:text-strong"
        >
          ↗
        </a>
      </div>
    </article>
  );
}

export function FuelVideos() {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 8-6 4 6 4V8z" />
              <rect x="2" y="6" width="14" height="12" rx="2" />
            </svg>
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-strong">Fuel</h2>
            <p className="text-xs text-muted">Watch one. Then close the tab and go do the work.</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {VIDEOS.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </section>
  );
}
