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
      {/* Cinematic hero banner */}
      <div className="relative mb-8 isolate overflow-hidden rounded-3xl border border-hairline">
        <img
          src="/images/fuel-hero.png"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
        <div className="relative px-6 py-14 sm:px-10 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline-strong bg-ink/40 px-3.5 py-1.5 text-xs font-medium text-fg backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-glow" />
            Fuel
          </span>
          <h2 className="mt-4 max-w-md font-display text-3xl font-bold leading-tight tracking-tight text-strong text-balance sm:text-4xl">
            Borrow the fire. Then go earn your own.
          </h2>
          <p className="mt-3 max-w-sm text-sm text-fg/90 text-pretty">
            Watch one. Then close the tab and go do the work.
          </p>
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
