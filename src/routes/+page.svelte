<script lang="ts">
    import AudioPlayer from "./AudioPlayer.svelte";
</script>

<AudioPlayer
    mutex
    audio={
    [
        {
            name:'君の知らない物語',
            artist: 'supercell',
            cover: 'https://blog-static.fengkx.top/svelte-aplayer/bakemonogatari-ed.jpg',
            url: "https://blog-static.fengkx.top/svelte-aplayer/bakemonogatari-ed.mp3"
        },
        {
            name:'Lepidoptera',
            artist: 'Lepidoptera',
            cover: 'https://img.freepik.com/free-psd/cineraria-flower-png-isolated-transparent-background_191095-10910.jpg?w=1060&t=st=1722487948~exp=1722488548~hmac=48711793ebbcf472818fbe2b47eec07c37790517d6c3a4ceca5517b4ea5a3dcf',
            url: "https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg"
        },
        {
            name:'win',
            artist: 'win',
            cover: 'https://img.freepik.com/premium-psd/illustration-beautiful-cozy-cup-coffee-with-pink-flowers_1198941-6258.jpg?w=996',
            url: "https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/win.ogg"
        }
    ]}
/>

<!-- <AudioPlayer mutex audio={
    [
        {
            name:'test',
            artist: 'supercell',
            cover: 'https://blog-static.fengkx.top/svelte-aplayer/bakemonogatari-ed.jpg',
            url: "https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg"
        },
        {
            name:'君の知らない物語',
            artist: 'supercell',
            cover: 'https://blog-static.fengkx.top/svelte-aplayer/bakemonogatari-ed.jpg',
            url: "https://blog-static.fengkx.top/svelte-aplayer/bakemonogatari-ed.mp3"
        }
    ]}
/> -->