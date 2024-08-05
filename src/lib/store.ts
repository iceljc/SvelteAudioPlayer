import { derived, writable } from "svelte/store";
import { parseLrc, secondToTime } from "./utils";

export const instances: AudioModel[] = [];

export type Audio = {
  name: string;
  artist: string;
  url: string;
  cover: string;
  lrc?: string;
  theme?: string;
};

export type AudioModel = {
  id: string;
  player: HTMLAudioElement;
};

export type GlobalState = {
  audio: Audio[];
  playingIndex: number;
};

export type ControlState = {
  loop: "none" | "all" | "one";
  order: "list" | "random";
  volume: number;
  showList: boolean;
};

export type VolumnState = {
  volumePercentage: string;
  muted: boolean;
};

export type DispatchFunc = (name: string, detail?: any) => void;


export function createMyStore(dispatch: DispatchFunc) {
  let currentTime = writable(0);
  let duration = writable(NaN);

  const rdTime = derived(
    [currentTime, duration],
    ([$currentTime, $duration]) => {
      let playPercentage = $currentTime / $duration;
      playPercentage = Math.max(playPercentage, 0);
      playPercentage = Math.min(playPercentage, 1);
      playPercentage *= 100;
      return {
        ptime: secondToTime($currentTime),
        duration: secondToTime($duration),
        playPercentage: `${playPercentage}%`,
      };
    }
  );

  let wtBufTime = writable(0);
  const rdBufTime = derived([wtBufTime, duration], ([$bufTime, $duration]) => {
    let bufferPercentage = $bufTime / $duration;
    bufferPercentage = Math.max(bufferPercentage, 0);
    bufferPercentage = Math.min(bufferPercentage, 1);
    bufferPercentage *= 100;
    return { bufferPercentage: `${bufferPercentage}%`, bufTime: $bufTime };
  });

  const playList = writable<GlobalState>({
    playingIndex: 0,
    audio: [],
  });

  const audioList = derived(playList, ($pl) => $pl.audio);
  const currentSong = derived(playList, ($wt) => $wt.audio[$wt.playingIndex]);

  let initSong = false;
  currentSong.subscribe((song) => {
    if (initSong) {
      dispatch("listswitch", song);
    }
    initSong = true;
  });

  let initAudioList = false;
  audioList.subscribe((list) => {
    if (initAudioList) {
      dispatch("listchange", list);
    }
    initAudioList = true;
  });

  return {
    playList,
    audioList,
    currentSong,
    currentTime,
    duration,
    rdTime,
    rdBufTime,
    wtBufTime,
  };
}



export function initAudio(audio: AudioModel, dispatch: DispatchFunc) {
  instances.push(audio);
  bindAudioEvent(audio.player, dispatch);
}

export function stopAll() {
  if (instances?.length > 0) {
    instances.forEach(audio => audio.player?.pause());
  }
}

export function clearInstance(id: string) {
  const idx = instances.findIndex(x => x.id === id);
  if (idx > -1) {
    if (!instances[idx].player?.paused) {
      instances[idx].player?.pause();
    }
    instances.splice(idx, 1);
  }
}


function bindAudioEvent(player: HTMLAudioElement, dispatch: DispatchFunc) {
  const audioEvents = [
    "abort",
    "canplay",
    "canplaythrough",
    "durationchange",
    "emptied",
    "ended",
    "error",
    "loadeddata",
    "loadedmetadata",
    "loadstart",
    "mozaudioavailable",
    "pause",
    "play",
    "playing",
    "progress",
    "ratechange",
    "seeked",
    "seeking",
    "stalled",
    "suspend",
    "timeupdate",
    "volumechange",
    "waiting",
  ];
  audioEvents.forEach((name) => {
    player?.addEventListener(name, (ev) => {
      dispatch(name, ev);
    });
  });
}