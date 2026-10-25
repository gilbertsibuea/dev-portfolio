"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"

/** Currently vibin playlist — swap / reorder anytime */
export const SPOTIFY_VIBIN_TRACKS = [
    {
        title: "Purple Rain",
        artist: "Prince",
        uri: "spotify:track:1uvyZBs4IZYRebHIB1747m",
    },
    {
        title: "In Your Atmosphere (Live)",
        artist: "John Mayer",
        uri: "spotify:track:0EUSbTvyZfo9QOcxunL9Ro",
    },
    {
        title: "Stop This Train",
        artist: "John Mayer",
        uri: "spotify:track:3E6iea9uEmB7gRru4lyP6h",
    },
    {
        title: "No Such Thing",
        artist: "John Mayer",
        uri: "spotify:track:6Vecwo7AHst9V2CE3kmwr0",
    },
    {
        title: "Free Fallin' (Live)",
        artist: "John Mayer",
        uri: "spotify:track:4LloVtxNZpeh7q7xdi1DQc",
    },
    {
        title: "Touch",
        artist: "Daft Punk",
        uri: "spotify:track:7oaEjLP2dTJLJsITbAxTOz",
    },
] as const

type SpotifyIFrameAPI = {
    createController: (
        element: HTMLElement,
        options: {
            uri?: string
            url?: string
            width?: number | string
            height?: number | string
        },
        callback: (controller: SpotifyEmbedController) => void
    ) => void
}

type SpotifyEmbedController = {
    loadUri: (uri: string, preferVideo?: boolean, startAt?: number, theme?: string) => void
    loadEntity?: (spotifyUriOrUrl: string, preferVideo?: boolean, startAt?: number) => void
    destroy: () => void
}

declare global {
    interface Window {
        onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void
        __spotifyIframeApi?: SpotifyIFrameAPI
        __spotifyIframeApiReadyQueue?: Array<(api: SpotifyIFrameAPI) => void>
    }
}

type SpotifyNowPlayingProps = {
    tracks?: readonly { title: string; artist: string; uri: string }[]
    className?: string
}

const SCRIPT_SRC = "https://open.spotify.com/embed/iframe-api/v1"

function ensureSpotifyScript() {
    if (typeof window === "undefined") return
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return

    const script = document.createElement("script")
    script.src = SCRIPT_SRC
    script.async = true
    document.body.appendChild(script)
}

function onSpotifyApiReady(cb: (api: SpotifyIFrameAPI) => void) {
    if (window.__spotifyIframeApi) {
        cb(window.__spotifyIframeApi)
        return
    }

    window.__spotifyIframeApiReadyQueue = window.__spotifyIframeApiReadyQueue || []
    window.__spotifyIframeApiReadyQueue.push(cb)

    const prev = window.onSpotifyIframeApiReady
    window.onSpotifyIframeApiReady = (api) => {
        window.__spotifyIframeApi = api
        prev?.(api)
        const queue = window.__spotifyIframeApiReadyQueue || []
        window.__spotifyIframeApiReadyQueue = []
        queue.forEach((fn) => fn(api))
    }
}

function loadTrack(controller: SpotifyEmbedController, uri: string) {
    try {
        if (controller.loadEntity) {
            controller.loadEntity(uri)
            return
        }
    } catch {
        // fall through
    }
    try {
        controller.loadUri(uri, false, 0, "dark")
    } catch {
        controller.loadUri(uri)
    }
}

export function SpotifyNowPlaying({
    tracks = SPOTIFY_VIBIN_TRACKS,
    className = "",
}: SpotifyNowPlayingProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const controllerRef = useRef<SpotifyEmbedController | null>(null)
    const readyRef = useRef(false)
    const indexRef = useRef(0)
    const tracksRef = useRef(tracks)
    const [index, setIndex] = useState(0)
    const reactId = useId().replace(/:/g, "")
    const elementId = `spotify-embed-${reactId}`

    tracksRef.current = tracks
    indexRef.current = index

    const current = tracks[index] ?? tracks[0]
    const total = tracks.length

    const go = useCallback(
        (next: number) => {
            if (total === 0) return
            setIndex(((next % total) + total) % total)
        },
        [total]
    )

    const goPrev = () => go(index - 1)
    const goNext = () => go(index + 1)

    // Create embed once
    useEffect(() => {
        let cancelled = false
        ensureSpotifyScript()

        onSpotifyApiReady((IFrameAPI) => {
            if (cancelled || !hostRef.current) return

            hostRef.current.innerHTML = ""
            const mount = document.createElement("div")
            mount.id = elementId
            hostRef.current.appendChild(mount)

            const startUri = tracksRef.current[indexRef.current]?.uri ?? tracksRef.current[0]?.uri
            if (!startUri) return

            IFrameAPI.createController(
                mount,
                {
                    uri: startUri,
                    width: "100%",
                    height: 152,
                },
                (controller) => {
                    if (cancelled) {
                        controller.destroy()
                        return
                    }
                    controllerRef.current = controller
                    readyRef.current = true
                    const uri =
                        tracksRef.current[indexRef.current]?.uri ?? tracksRef.current[0]?.uri
                    if (uri) loadTrack(controller, uri)
                }
            )
        })

        return () => {
            cancelled = true
            readyRef.current = false
            try {
                controllerRef.current?.destroy()
            } catch {
                // ignore
            }
            controllerRef.current = null
        }
    }, [elementId])

    // Swap track when slide changes
    useEffect(() => {
        const controller = controllerRef.current
        if (!controller || !readyRef.current || !current?.uri) return
        loadTrack(controller, current.uri)
    }, [current?.uri, index])

    return (
        <div className={className}>
            <div className="flex items-end justify-between gap-3 mb-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                    Currently vibin to
                </p>
                <p className="font-mono text-[10px] tabular-nums text-white/30">
                    {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </p>
            </div>

            <div className="relative">
                <div
                    ref={hostRef}
                    className="min-h-[152px] w-full overflow-hidden rounded-xl bg-black/40"
                />

                {total > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={goPrev}
                            aria-label="Previous track"
                            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 p-2 text-white/70 bg-black/45 hover:bg-black/70 hover:text-white transition-colors"
                        >
                            <FiChevronLeft className="text-lg" />
                        </button>
                        <button
                            type="button"
                            onClick={goNext}
                            aria-label="Next track"
                            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 p-2 text-white/70 bg-black/45 hover:bg-black/70 hover:text-white transition-colors"
                        >
                            <FiChevronRight className="text-lg" />
                        </button>
                    </>
                )}
            </div>

            {current && (
                <p className="mt-3 text-sm text-white/70 truncate">
                    <span className="text-white font-medium">{current.title}</span>
                    <span className="text-white/35"> · {current.artist}</span>
                </p>
            )}

            {total > 1 && (
                <div className="mt-3 flex items-center gap-1.5">
                    {tracks.map((track, i) => (
                        <button
                            key={track.uri}
                            type="button"
                            aria-label={`Play ${track.title}`}
                            onClick={() => setIndex(i)}
                            className={`h-1 rounded-full transition-all ${
                                i === index ? "w-6 bg-[#1DB954]" : "w-2.5 bg-white/20 hover:bg-white/35"
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
