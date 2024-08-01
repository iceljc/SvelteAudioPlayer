<script lang="ts">
    import {
        initPlayer,
        instances,
        createMyStore
    } from "../lib/store";
    import { volumeEventHandlers } from "../lib/volume-handler";
    import { progressEventHandlers } from "../lib/progress-handler";
    import { onDestroy, onMount, createEventDispatcher } from "svelte";
    import { propsBool, isMobile } from "../lib/utils";
    import { get_current_component } from "svelte/internal";
    import type { Audio } from "../lib/store";

    import {
        soundUnmuted,
        soundMuted,
        randomOrder,
        loadingIcon,
        listOrder,
        loopOne,
        loopAll,
        loopNone,
    } from "../assets/svg";

    const component = get_current_component();
    const svelteDispatch = createEventDispatcher();
    const dispatch = (name: string, detail?: any) => {
        svelteDispatch(name, detail);
        component.dispatchEvent && component.dispatchEvent(new CustomEvent(name, { detail }));
    };

    const {
        playList,
        audioList,
        currentSong,
        currentTime,
        duration,
        rdTime,
        rdBufTime,
        wtBufTime,
    } = createMyStore(dispatch);

    export let audio: Audio[] | string;
    export let order: "list" | "random" = 'list';
    export let loop: "none" | "all" | "one" = 'all';
    export let volume = 0.7;
    export let mini = false;
    export let mutex = true;
    export let theme: string = "#fadfa3";
    export let listMaxHeight: number = Infinity;
    export let playDelay = 300;
    export let autoPlayNextOnClick: boolean = true;
    export let baseFontSize = "12px";

    let volumeBar: HTMLElement;
    let playedBar: HTMLElement;
    let volumeDragStart: () => void, volumeDragMove: (arg0: any) => void, volumeDragEnd: (arg0: any) => void;
    let progressDragStart: () => void, progressDragMove: (arg0: any) => void, progressDragEnd: (arg0: any) => void;
    let toggleVolumeMute: () => void;
    let playListElement: HTMLElement;
    let rootEl: HTMLElement;
    let player: HTMLAudioElement;
    let isShowList: boolean = false;
    let muted: boolean = false;
    let volumePercentage: string;

    onMount(() => {
        player = init();
        const volumeHandlers = volumeEventHandlers(player, volumeBar);
        volumeDragStart = volumeHandlers.volumeDragStart;
        volumeDragMove = volumeHandlers.volumeDragMove;
        volumeDragEnd = volumeHandlers.volumeDragEnd;
        toggleVolumeMute = volumeHandlers.toggleVolumeMute;
        const progressHandlers = progressEventHandlers(player, playedBar);
        progressDragStart = progressHandlers.progressDragStart;
        progressDragMove = progressHandlers.progressDragMove;
        progressDragEnd = progressHandlers.progressDragEnd;

        playListElement?.addEventListener("transitionend", () => {
            playerListHeight = Math.min(playListElement?.scrollHeight ?? 0, listMaxHeight);
        });

        player.addEventListener("timeupdate", () => {
            $currentTime = player.currentTime;
        });

        player.addEventListener("volumechange", () => {
            volume = player.volume;
        });
        player.addEventListener("loadedmetadata", () => {
            $duration = player.duration;
        });
        
        player.addEventListener("error", () => {
            console.warn("An audio error has occurred, player will skip forward in 2 seconds.");
            if ($audioList.length > 1) {
                setTimeout(() => {
                    $playList.playingIndex = ($playList.playingIndex + 1) % $audioList.length;
                        if (player.paused) {
                            play();
                        }
                }, 2000);
            }
        });

        const setBufTime = () => {
            const bufTime = player.buffered.length ? player.buffered.end(player.buffered.length - 1) : 0;
            $wtBufTime = bufTime;
        };

        player.addEventListener("progress", setBufTime);
        player.addEventListener("canplay", () => {
            setBufTime();
        });
        player.addEventListener("durationchange", () => {
            $duration = player.duration;
        });

        player.addEventListener("ended", () => {
            jumpNext();
        });
    });

    onDestroy(() => {
        dispatch("destroy");
    });

    const init = () => {
        const audioPlayer = document.createElement("audio");
        initPlayer(audioPlayer, dispatch);
        isShowList = !propsBool($$props, "list_folded") && $audioList.length > 1;
        volume = Math.max(volume, 0);
        volume = Math.min(volume, 1);
        audioPlayer.volume = volume;
        return audioPlayer;
    }

    $: parsedAudio = typeof audio === "string" ? JSON.parse(audio) : audio;
    $: $playList.audio = Array.isArray(parsedAudio) ? parsedAudio : [parsedAudio];
    $: {
        if (muted) {
            volumePercentage = '0%';
        } else {
            volumePercentage = `${volume * 100}%`;
        }
    }
    $: playerListHeight = Math.min(playListElement?.scrollHeight ?? 0, listMaxHeight);
    $: themeColor = $currentSong.theme ?? theme;
    $: {
        if (player) {
            player.src = $currentSong.url;
        }
    }
    $: {
        if (rootEl) {
            rootEl.style.setProperty("--theme-color", themeColor);
            rootEl.style.setProperty("--base-font-size", baseFontSize);
        }
    }

    const play = () => {
        if (mutex) {
            instances.forEach((audio) => audio.pause());
        }

        if (player) {
            setTimeout(() => {
                player.play().catch((err) => {
                    console.error(err);
                });
            }, 500);
        }
    };

    const jumpNext = () => {
        const audios = $audioList;
        const nextIdx = ($playList.playingIndex + 1) % audios.length;
        if (loop === "none") {
            if (order === "list") {
                if ($playList.playingIndex < audios.length - 1) {
                    const promise = buildNextSongPromise(nextIdx);
                    promise.then(() => play());
                } else {
                    $playList.playingIndex = ($playList.playingIndex + 1) % audios.length;
                    player.src = $currentSong.url;
                    player.pause();
                }
            } else if (order === "random") {
                const randomIdx = Math.floor(audios.length * Math.random());
                let targetIdx = 0;
                if (randomIdx === $playList.playingIndex) {
                    targetIdx = nextIdx;
                } else {
                    targetIdx = randomIdx;
                }
                const promise = buildNextSongPromise(targetIdx);
                promise.then(() => play());
            }
        } else if (loop === "one") {
            player.currentTime = 0;
        } else if (loop === "all") {
            const promise = buildNextSongPromise(nextIdx);
            promise.then(() => play());
        }
    };

    const buildNextSongPromise = (idx: number) => {
        return new Promise((resolve: any) => {
            $playList.playingIndex = idx;
            player.currentTime = 0;
            player.src = $currentSong.url;
            player.pause();
            player.load();
            setTimeout(() => {
                resolve();
            }, playDelay > 0 ? playDelay : 0);
        });
    }

    const switchSong = (idx: number) => {
        const promise = buildNextSongPromise(idx);
        if (autoPlayNextOnClick) {
            promise.then(() => {
                play();
            });
        }
    }

    const clickOrder = () => {
        order = order === "list" ? "random" : "list";
    }

    const clickLoop = () => {
        if (loop === "all") {
            loop = "one";
        } else if (loop === "one") {
            loop = "none";
        } else if (loop === "none") {
            loop = "all";
        }
    }

    const toggleList = () => {
        isShowList = !isShowList;
        isShowList ? dispatch("listshow") : dispatch("listhide");
    }

    const togglePlay = () => {
        if (player?.paused) {
            play();
        } else {
            setTimeout(() => {
                player.pause();
            }, playDelay);
        }
    }
</script>

<div
    bind:this={rootEl}
    class="aplayer"
    class:aplayer-withlist={$audioList.length > 1}
    class:aplayer-narrow={mini}
    class:aplayer-mobile={isMobile}
>
  <div class="aplayer-body ">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="aplayer-pic"
      style="background-image: url( {$currentSong.cover} )"
      on:click={() => togglePlay()}
    >
        {#if !player?.paused}
        <div class="aplayer-button aplayer-pause">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                viewBox="0 0 17 32"
            >
                <path
                    d="M14.080 4.8q2.88 0 2.88 2.048v18.24q0 2.112-2.88 2.112t-2.88-2.112v-18.24q0-2.048 2.88-2.048zM2.88 4.8q2.88 0 2.88 2.048v18.24q0 2.112-2.88 2.112t-2.88-2.112v-18.24q0-2.048 2.88-2.048z"
                />
            </svg>
        </div>
        {:else}
        <div class="aplayer-button aplayer-play">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                viewBox="0 0 16 31"
            >
                <path
                    d="M15.552 15.168q0.448 0.32 0.448 0.832 0 0.448-0.448 0.768l-13.696 8.512q-0.768 0.512-1.312 0.192t-0.544-1.28v-16.448q0-0.96 0.544-1.28t1.312 0.192z"
                />
            </svg>
        </div>
        {/if}
    </div>

    <div class="aplayer-info">
        <div class="aplayer-music">
            <span class="aplayer-title">{$currentSong.name || ''}</span>
            <span class="aplayer-artist">{$currentSong.artist || ''}</span>
        </div>

        <div class="aplayer-controller">
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
                class="aplayer-bar-wrap"
                bind:this={playedBar}
                on:mousedown={progressDragStart}
                on:mousemove={progressDragMove}
                on:mouseup={progressDragEnd}
                on:mouseleave={progressDragEnd}
                on:touchstart={progressDragStart}
                on:touchmove={progressDragMove}
                on:touchend={progressDragEnd}
            >
                <div class="aplayer-bar">
                    <div
                        class="aplayer-loaded"
                        style="width: {$rdBufTime.bufferPercentage}"
                    />
                    <div class="aplayer-played" style="width: {$rdTime.playPercentage}">
                        <div class="aplayer-thumb">
                            <span
                                class="aplayer-loading-icon"
                                style="display: none"
                            >
                                {@html loadingIcon}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="aplayer-time">
                <span class="aplayer-time-inner">
                    <span class="aplayer-ptime">{$rdTime.ptime}</span> /
                    <span class="aplayer-dtime">{$rdTime.duration}</span>
                </span>

                <div class="aplayer-volume-wrap">
                    <button
                        type="button"
                        class="aplayer-icon aplayer-icon-volume-down"
                        on:click|capture={() => {
                            muted = !muted;
                            toggleVolumeMute();
                        }}
                    >
                        {#if muted || player?.muted}
                            {@html soundMuted}
                        {:else}
                            {@html soundUnmuted}
                        {/if}
                    </button>
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div
                        class="aplayer-volume-bar-wrap"
                        on:mousedown={volumeDragStart}
                        on:mousemove={volumeDragMove}
                        on:mouseup={volumeDragEnd}
                        on:mouseleave={volumeDragEnd}
                        on:touchstart={volumeDragStart}
                        on:touchmove={volumeDragMove}
                        on:touchend={volumeDragEnd}
                    >
                        <div class="aplayer-volume-bar" bind:this={volumeBar}>
                            <div
                                class="aplayer-volume"
                                style="height: {player?.muted ? '0px' : volumePercentage}"
                            />
                        </div>
                    </div>
                </div>
                <button
                    type="button"
                    class="aplayer-icon aplayer-icon-order"
                    on:click={() => clickOrder()}
                >
                    {#if order === "random"}
                        {@html randomOrder}
                    {:else}
                        {@html listOrder}
                    {/if}
                </button>
                <button
                    type="button"
                    class="aplayer-icon aplayer-icon-loop"
                    on:click={() => clickLoop()}
                >
                    {#if loop === "none"}
                        {@html loopNone}
                    {:else if loop === "one"}
                        {@html loopOne}
                    {:else if loop === "all"}
                        {@html loopAll}
                    {/if}
                </button>

                {#if $audioList.length > 1}
                <button
                    type="button"
                    class="aplayer-icon aplayer-icon-menu"
                    on:click={() => toggleList()}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        viewBox="0 0 22 32"
                    >
                        <path
                            d="M20.8 14.4q0.704 0 1.152 0.48t0.448 1.12-0.48 1.12-1.12 0.48h-19.2q-0.64 0-1.12-0.48t-0.48-1.12 0.448-1.12 1.152-0.48h19.2zM1.6 11.2q-0.64 0-1.12-0.48t-0.48-1.12 0.448-1.12 1.152-0.48h19.2q0.704 0 1.152 0.48t0.448 1.12-0.48 1.12-1.12 0.48h-19.2zM20.8 20.8q0.704 0 1.152 0.48t0.448 1.12-0.48 1.12-1.12 0.48h-19.2q-0.64 0-1.12-0.48t-0.48-1.12 0.448-1.12 1.152-0.48h19.2z"
                        />
                    </svg>
                </button>
                {/if}
            </div>
        </div>
    </div>

    <div
        class="aplayer-list"
        style="height: {isShowList ? `${playerListHeight}px` : '0px'}"
        bind:this={playListElement}
    >
        <ol>
            {#each $audioList as song, idx}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <li on:click={() => switchSong(idx) }>
                {#if idx === $playList.playingIndex}
                    <span class="aplayer-list-cur" />
                {/if}
                    <span class="aplayer-list-index">{idx + 1}</span>
                    <span class="aplayer-list-title">{song.name}</span>
                    <span class="aplayer-list-artist">{song.artist}</span>
                </li>
            {/each}
        </ol>
    </div>
  </div>
</div>

<style lang="scss">
    .aplayer {
        --base-font-size: 12px;
        --aplayer-height: calc(var(--base-font-size) * 5.5);
        --theme-color: #fadfa3;
        position: relative;
        background: #fff;
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.07), 0 1px 5px 0 rgba(0, 0, 0, 0.1);
        font-family: Arial, Helvetica, sans-serif;
        overflow: hidden;
        border-radius: 2px;
        user-select: none;
        line-height: normal;
        svg {
            width: 100%;
            height: 100%;

            path {
                fill: #fff;
            }
        }
  
        .aplayer-icon {
            width: calc(var(--base-font-size) + 3px);
            height: calc(var(--base-font-size) + 3px);
            border: none;
            background-color: transparent;
            outline: none;
            cursor: pointer;
            opacity: 0.8;
            vertical-align: middle;
            padding: 0;
            font-size: var(--base-font-size);
            margin: 0;
            display: inline-block;

            path {
                transition: all 0.2s ease-in-out;
            }
        }
  
        .aplayer-pic {
            position: relative;
            float: left;
            height: var(--aplayer-height);
            width: var(--aplayer-height);
            background-color: antiquewhite;
            background-size: cover;
            background-position: center;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: all 0.3s ease;
            cursor: pointer;

            &:hover .aplayer-button {
                opacity: 1;
            }
            .aplayer-button {
                position: absolute;
                border-radius: 50%;
                opacity: 0.8;
                text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
                box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
                background: rgba(0, 0, 0, 0.2);
                transition: all 0.1s ease;
            }
            .aplayer-play {
                width: 26px;
                height: 26px;
                svg {
                    position: absolute;
                    top: 3px;
                    left: 4px;
                    height: 20px;
                    width: 20px;
                }
            }
            .aplayer-pause {
                width: 26px;
                height: 26px;
                // border: 2px solid #fff;
                // bottom: 4px;
                // right: 4px;
                svg {
                    position: absolute;
                    top: 3px;
                    left: 4px;
                    height: 20px;
                    width: 20px;
                }
            }
        }

        .aplayer-info {
            margin-left: var(--aplayer-height);
            height: var(--aplayer-height);
            padding: 14px 7px 0 10px;
            box-sizing: border-box;
            .aplayer-music {
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                user-select: text;
                margin: 0 0 calc(var(--base-font-size) + 1px) 5px;
                padding-bottom: 2px;
                cursor: default;

                .aplayer-title {
                    font-size: calc(var(--base-font-size) + 2px);
                }
                .aplayer-artist {
                    font-size: var(--base-font-size);
                    color: #666;
                }
            }

            .aplayer-controller {
                display: flex;
                position: relative;
                align-items: center;

                .aplayer-bar-wrap {
                    flex: 1;
                    margin: 0 0 0 5px;
                    padding: 4px 0;
                    cursor: pointer !important;

                    &:hover {
                        .aplayer-bar .aplayer-played .aplayer-thumb {
                            transform: scale(1);
                        }
                    }
                    .aplayer-bar {
                        position: relative;
                        height: 2px;
                        width: 100%;
                        background: #cdcdcd;

                        .aplayer-loaded {
                            position: absolute;
                            left: 0;
                            top: 0;
                            bottom: 0;
                            background: #aaa;
                            height: 2px;
                            transition: all 0.5s ease;
                        }
                        .aplayer-played {
                            position: absolute;
                            left: 0;
                            top: 0;
                            bottom: 0;
                            height: 2px;
                            background: var(--theme-color) none repeat scroll 0 0;

                            .aplayer-thumb {
                                position: absolute;
                                top: 0;
                                right: 5px;
                                margin-top: -4px;
                                margin-right: -10px;
                                height: 10px;
                                width: 10px;
                                border-radius: 50%;
                                cursor: pointer;
                                transition: all 0.3s ease-in-out;
                                background: var(--theme-color) none repeat scroll 0 0;
                                transform: scale(0);
                            }
                        }
                    }
                }
                .aplayer-loading-icon {
                    //display: none;
                    svg {
                        display: block;
                        position: absolute;
                        animation: rotate 1s linear infinite;
                    }
                }
                .aplayer-time {
                    position: relative;
                    right: 0;
                    bottom: 4px;
                    height: calc(var(--base-font-size) + 5px);
                    color: #999;
                    font-size: 11px;
                    padding-left: 7px;

                    .aplayer-time-inner {
                        vertical-align: center;
                    }
                    .aplayer-icon {
                        cursor: pointer;
                        transition: all 0.2s ease;
                        path {
                            fill: #666;
                        }
                    }
                }
                .aplayer-volume-wrap {
                    display: inline-block;
                    position: relative;
                    margin-left: 3px;
                    cursor: pointer;

                    &:hover .aplayer-volume-bar-wrap {
                        height: 40px;
                    }

                    .aplayer-volume-bar-wrap {
                        position: absolute;
                        bottom: 15px;
                        right: -3px;
                        width: 25px;
                        height: 0;
                        z-index: 99;
                        overflow: hidden;
                        transition: all 0.2s ease-in-out;

                        .aplayer-volume-bar {
                            position: absolute;
                            bottom: 0;
                            right: 10px;
                            width: 5px;
                            height: 35px;
                            background: #aaa;
                            border-radius: 2.5px;
                            overflow: hidden;
                            .aplayer-volume {
                                background: var(--theme-color) none repeat scroll 0 0;
                                position: absolute;
                                bottom: 0;
                                right: 0;
                                width: 5px;
                                transition: all 0.1s ease;
                            }
                        }
                    }
                }
            }
        }
        .aplayer-list {
            //overflow: auto;
            scrollbar-width: none;
            transition: all 0.5s ease;
            will-change: height;
            display: none;
            overflow: hidden;
            list-style-type: none;
            margin: 0;
            padding: 0;
            overflow-y: auto;
            ol {
                list-style-type: none;
                margin: 0;
                padding: 0;
                overflow-y: auto;
            }
            li {
                position: relative;
                text-align: left;
                height: calc((var(--base-font-size) + 4px) * 2);
                line-height: 32px;
                padding: 0 15px;
                font-size: var(--base-font-size);
                border-top: 1px solid #e9e9e9;
                cursor: pointer;
                transition: all 0.2s ease;
                overflow: hidden;
                margin: 0;

                &:first-child {
                    border-top: none;
                }

                &:hover {
                    background: #efefef;
                }

                .aplayer-list-cur {
                    width: 3px;
                    height: calc((var(--base-font-size) + 4px) * 2 - 10px);
                    position: absolute;
                    left: 0;
                    top: 5px;
                    cursor: pointer;
                    background-color: var(--theme-color);
                }
                .aplayer-list-index {
                    color: #666;
                    margin-right: 12px;
                    cursor: pointer;
                }
                .aplayer-list-artist {
                    color: #666;
                    float: right;
                    cursor: pointer;
                }
            }
        }
  
        &.aplayer-withlist {
            .aplayer-list {
                display: block;
            }
        }
        &.aplayer-narrow {
            width: var(--aplayer-height);

            .aplayer-info {
                display: none;
            }
            .aplayer-list {
                display: none;
            }
            .aplayer-pic,
            .aplayer-body {
                height: var(--aplayer-height);
                width: var(--aplayer-height);
            }
        }
        &.aplayer-mobile {
            .aplayer-icon-volume-down {
                display: none;
            }
        }
    }

    @keyframes aplayer-roll {
        0% {
            left: 0;
        }
        100% {
            left: -100%;
        }
    }
  
    @keyframes rotate {
        0% {
            transform: rotate(0);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>