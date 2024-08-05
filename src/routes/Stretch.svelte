<script lang="ts">
	import type { SpinnerTypes } from '../types/spinner.type';
	import { range, durationUnitRegex } from '../lib/utils';
	export let color: SpinnerTypes['color'] = '#FF3E00';
	export let unit: SpinnerTypes['unit'] = 'px';
	export let duration: SpinnerTypes['duration'] = '1.2s';
	export let size: SpinnerTypes['size'] = '60';
	export let pause: SpinnerTypes['pause'] = false;
  export let gap: SpinnerTypes['gap'] = '10';
	let durationUnit: string = duration.match(durationUnitRegex)?.[0] ?? 's';
	let durationNum: string = duration.replace(durationUnitRegex, '');
</script>

<div class="wrapper" style="--size: {size}{unit}; --color: {color}; --duration: {duration}; --gap: {gap}{unit};">
	{#each range(5, 1) as version}
		<div
			class="rect"
			class:pause-animation={pause}
			style="animation-delay: {(version - 1) * (+durationNum / 12)}{durationUnit}"
		/>
	{/each}
</div>

<style>
	.wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    /* width: calc(var(--size) * var(--count) + var(--gap) * (var(--count) - 1));*/
    width: fit-content;
		height: calc(var(--size));
    gap: var(--gap);
    margin-top: calc(var(--size) * 3);
    margin-bottom: calc(var(--size) * 3);
	}
	.rect {
    width: calc(var(--size) / 1.2);
		height: calc(var(--size) * 5);
		display: inline-block;
		transform: scaleY(0.2);
		background-color: var(--color);
		animation: stretch var(--duration) ease-in-out infinite;
	}
	.pause-animation {
		animation-play-state: paused;
	}
	@keyframes stretch {
		0%,
		40%,
		100% {
			transform: scaleY(0.3);
		}
		20% {
			transform: scaleY(1);
		}
	}
</style>