export function volumeEventHandlers(player: HTMLAudioElement, volumeBar: HTMLElement) {
    let volumeActive = false;

    const volumeDragStart = () => {
      volumeActive = true;
    };

    const volumeDragMove = (ev: any) => {
      if (volumeActive) {
        let percentage = 1 - ((ev.clientY || ev.changedTouches[0].clientY) - volumeBar.getBoundingClientRect().top) / volumeBar.clientHeight;
        percentage = Math.max(percentage, 0);
        percentage = Math.min(percentage, 1);
        player.volume = percentage;
      }
    };

    const volumeDragEnd = (ev: any) => {
      if (volumeActive) {
        let percentage = 1 - ((ev.clientY || ev.changedTouches[0].clientY) - volumeBar.getBoundingClientRect().top) / volumeBar.clientHeight;
        percentage = Math.max(percentage, 0);
        percentage = Math.min(percentage, 1);
        player.volume = percentage;
        volumeActive = false;
      }
    };

    const toggleVolumeMute = () => {
      player.muted = !player.muted;
    };

    return { volumeDragStart, volumeDragMove, volumeDragEnd, toggleVolumeMute };
}