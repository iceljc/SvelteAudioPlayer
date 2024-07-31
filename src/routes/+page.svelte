<script lang="ts">
    import AudioPlayer from "./AudioPlayer.svelte";
    import MyAPlayer from "./MyAPlayer.svelte";
    import MyAudioPlayer from "./MyAudioPlayer.svelte";
    import Test from "./Test.svelte";
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
                name:'test',
                artist: 'supercell',
                cover: 'https://blog-static.fengkx.top/svelte-aplayer/bakemonogatari-ed.jpg',
                url: "https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg"
            }
        ]
    }
/>

<MyAPlayer mutex audio={
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
/>

<!-- <Test /> -->