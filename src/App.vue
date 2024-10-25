<script setup lang="ts">
import { shallowRef, watch } from 'vue';
import { Game } from './main';
import { Controller } from './modules/controller';
import { Render } from './modules/render';

// utils
const controller = new Controller();
const render = new Render();
const game = shallowRef<Game>();

const audio = new Audio('/bgm.mp3');
audio.loop = true;

// main
function startGame() {
  game.value = new Game(controller, render);
  game.value.start();
  audio.currentTime = 1.5;
  audio.play();
}

function stopGame() {
  game.value = undefined;
  audio.currentTime = 0;
  audio.pause();
}

function restartGame() {
  stopGame();
  startGame();
}

watch(() => game.value && game.value.health.value, (health) => {
  if (health !== undefined && health <= 0) game.value!.stop()
})
</script>

<template>
  <div class="page" v-if="!game">
    <h1 class="title">Game</h1>
    <div class="menu"><button @click="startGame">Start</button></div>
  </div>
  <div v-else-if="game.health.value > 0" class="game">
    <div class="menu-bar">
      <button @click="game.togglePause">{{ game.isPaused ? 'Resume' : 'Pause' }}</button>
    </div>
    <div class="info-bar">
      <span><img class="image-label" src="/heart.png"><span class="slider"><span
            :style="`--width: ${game.health.value / 30 * 100}%`" /></span></span>
      <span>Level: {{ game.level.value }}</span>
    </div>
  </div>
  <div class="page" v-else>
    <h1 class="title">Game Over</h1>
    <div class="menu">
      <button @click="restartGame">Restart</button>
      <button @click="stopGame">Back</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.title {
  text-align: center;
}

.menu {
  gap: 1rem;
  margin: auto;
  display: flex;
  width: fit-content;
  flex-direction: column;

  &>button {
    padding: 0.2em 1em;
  }
}

.game {
  .menu-bar {
    position: fixed;
    padding: .5em;
    left: 0;
    top: 0;

    display: flex;
    gap: 1em;
    flex-direction: column;

    & button {
      margin: 0;
      border: none;
      display: block;
      font-size: 16px;
      padding: .5em;
      border-radius: .2em;
      background: var(--background);

      &:hover {
        filter: brightness(.8);
      }
    }

  }

  .info-bar {
    font-size: 16px;
    position: fixed;
    right: 0;
    top: 0;
    padding: .5em;
    display: flex;
    gap: 1em;

    & span {
      border-radius: .2em;
      background: var(--background);
      padding: .2em .5em;
    }

    & .slider {
      padding: 0;
      width: 10em;
      height: .8em;
      overflow: hidden;
      position: relative;
      border-radius: .2em;
      display: inline-block;
      vertical-align: baseline;
      background: var(--color);

      & span {
        height: 100%;
        display: block;
        width: var(--width);
        background: var(--danger);
      }
    }
  }


  & .image-label {
    top: 0;
    left: 0;
    z-index: 1;
    width: 3em;
    height: 3em;
    position: absolute;
    image-rendering: pixelated;
    transform: translate(-25%, 0);
  }
}

.page {
  width: 100vw;
  height: 100vh;
}
</style>