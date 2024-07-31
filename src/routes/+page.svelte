<script lang="ts">
    import MyAPlayer from "./MyAPlayer.svelte";
</script>

<MyAPlayer mutex audio={
        [
            {
                name:'君の知らない物語',
                artist: 'supercell',
                cover: 'https://blog-static.fengkx.top/svelte-aplayer/bakemonogatari-ed.jpg',
                url: "https://blog-static.fengkx.top/svelte-aplayer/bakemonogatari-ed.mp3"
            },
            {
                name:'Lepidoptera',
                artist: 'supercell',
                cover: 'https://blog-static.fengkx.top/svelte-aplayer/bakemonogatari-ed.jpg',
                url: "https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg"
            },
            {
                name:'win',
                artist: 'supercell',
                cover: 'https://blog-static.fengkx.top/svelte-aplayer/bakemonogatari-ed.jpg',
                url: "https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/win.ogg"
            }
        ]
    }
/>

<!-- <MyAPlayer mutex audio={
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
    ]
}
/> -->