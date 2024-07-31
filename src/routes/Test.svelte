<script lang="ts">
    import { createTestStore } from "$lib/store";
    import { onDestroy, onMount } from "svelte";

    const {
        name,
        audio
    } = createTestStore();

    onMount(() => {
        console.log('inside test onmount', $audio);
    });
</script>

<div>
    Hello
</div>