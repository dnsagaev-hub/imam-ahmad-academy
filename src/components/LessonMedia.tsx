"use client";

import { useState } from "react";

import { toEmbedUrl } from "@/lib/video";

import { fmtClock, useListenMap } from "@/lib/listenStore";

import { type Track, useAudioPlayer } from "./audio/AudioPlayer";
import type { ListenEntry } from "@/lib/listenStore";

/** Плеер урока: видео (встроенный Kinescope / VK / Rutube) и одно или несколько аудио через общий плеер сайта. */
export function LessonMedia({
  videoUrl,
  audioUrl,
  title,
  lessonId,
  slug,
  courseTitle,
  categoryLabel,
  teacher,
  audios,
}: {
  videoUrl?: string | null;
  audioUrl?: string | null;
  /** Дополнительные аудио урока (поле «Ещё аудио к уроку»): подпись и ссылка на файл. */
  audios?: { id: string; caption: string; url: string }[];
  title: string;
  lessonId: string | number;
  slug: string;
  courseTitle?: string | null;
  categoryLabel?: string;
  teacher?: string | null;
}) {
  const safeVideo = toEmbedUrl(videoUrl);
  const [mode, setMode] = useState<"video" | "audio">(
    safeVideo ? "video" : "audio",
  );
  const listen = useListenMap();
  // Основное аудио хранит позицию прослушивания под id урока (как раньше), дополнительные — под «id:строка».
  const tracks = [
    ...(audioUrl
      ? [{ id: String(lessonId), caption: "Аудиозапись урока", url: audioUrl }]
      : []),
    ...(audios ?? []).map((a) => ({
      id: `${lessonId}:${a.id}`,
      caption: a.caption,
      url: a.url,
    })),
  ];
  const hasAudio = tracks.length > 0;
  if (!safeVideo && !hasAudio) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {safeVideo && hasAudio ? (
        <div className="seg" role="group" aria-label="Формат урока">
          <button
            type="button"
            aria-pressed={mode === "video"}
            onClick={() => setMode("video")}
          >
            Видео
          </button>
          <button
            type="button"
            aria-pressed={mode === "audio"}
            onClick={() => setMode("audio")}
          >
            Аудио
          </button>
        </div>
      ) : null}

      {mode === "video" && safeVideo ? (
        <div className="player">
          <iframe
            src={safeVideo}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : null}

      {mode === "audio" && tracks.length ? (
        <div className="lesson-audio">
          <div className="lesson-audio__head">
            <HeadphonesIcon />
            {tracks.length > 1
              ? `Аудио урока · ${tracks.length}`
              : "Аудио урока"}
          </div>
          <ul className="lesson-audio__list">
            {tracks.map((t) => (
              <AudioRow
                key={t.id}
                track={{
                  id: t.id,
                  title: tracks.length > 1 ? `${title}: ${t.caption}` : title,
                  subtitle: [courseTitle ?? categoryLabel, teacher]
                    .filter(Boolean)
                    .join(" · "),
                  url: t.url,
                  href: `/lessons/${slug}`,
                }}
                caption={tracks.length > 1 ? t.caption : "Слушать урок"}
                entry={listen[t.id]}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function HeadphonesIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="14" width="5" height="7" rx="2" />
      <rect x="16" y="14" width="5" height="7" rx="2" />
    </svg>
  );
}

/** Одна запись: круглая кнопка «играть/пауза», подпись, где остановились, скачать. */
function AudioRow({
  track,
  caption,
  entry,
}: {
  track: Track;
  caption: string;
  entry?: ListenEntry;
}) {
  const { current, playing, play } = useAudioPlayer();
  const on = current?.id === track.id && playing;
  const status = entry
    ? entry.done
      ? "Прослушано"
      : `Остановились на ${fmtClock(entry.t)}`
    : null;
  const pct = entry
    ? entry.done
      ? 100
      : Math.round((entry.t / Math.max(entry.d, 1)) * 100)
    : 0;
  return (
    <li
      className={`lesson-audio__row${on ? " is-on" : ""}${entry?.done ? " is-done" : ""}`}
    >
      <button
        type="button"
        className="lesson-audio__play"
        onClick={() => play(track)}
        aria-label={`${on ? "Пауза" : "Слушать"}: ${caption}`}
      >
        {on ? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
          </svg>
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <div className="lesson-audio__text">
        <span className="lesson-audio__cap">{caption}</span>
        {status ? <span className="lesson-audio__st">{status}</span> : null}
        {entry && !entry.done ? (
          <span className="lesson-audio__bar">
            <span style={{ width: `${pct}%` }} />
          </span>
        ) : null}
      </div>
      <a
        className="lesson-audio__dl"
        href={track.url}
        download
        aria-label={`Скачать MP3: ${caption}`}
        title="Скачать MP3"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
        </svg>
      </a>
    </li>
  );
}
