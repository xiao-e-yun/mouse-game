<script setup lang="ts">
import { shallowRef } from 'vue';
import { Game } from './main';
import { Controller } from './modules/controller';
import { Render } from './modules/render';
import { InventoryItem } from './inventory/utils';
import { audioManager } from './modules/audios';
import { preload } from './preload';

const preloadStatus = preload()

// utils
const controller = new Controller();
const render = new Render();
const game = shallowRef<Game>();

// main
function startGame() {
  game.value = new Game(controller, render);
  game.value.start();
}

function stopGame() {
  if (game.value) game.value!.stop();
  game.value = undefined;
}

function restartGame() {
  stopGame();
  startGame();
}

async function buttonSound() {
  audioManager.play('button');
}
</script>

<template>
  <div class="page" v-if="!preloadStatus.ready">
    <h1>Loading...</h1>
    <span>Loaded: {{ preloadStatus.loaded }}</span><br>
    <span>Total: {{ preloadStatus.total }}</span>
  </div>
  <div class="page" v-else-if="!game">
    <h1>Mouse Game</h1>
    <div class="menu">
      <button @click="startGame" class="icon-btn"><img src="/buttons/start.png"></button>
    </div>
    <fieldset>
      <legend>Rule</legend>
      You are a weapon.
      Survive as long as possible by hovering over enemies to attack them.<wbr>
      Click to cast a spell.<wbr>
      Upgrade your items to improve your chances of survival.
    </fieldset>
  </div>
  <div v-else-if="game.isRunning" class="game"
    :style="'animation-play-state:' + (game.isPaused ? 'paused' : 'running')">

    <div class="menu-bar">
      <button @click="buttonSound(), game.togglePause()" class="icon-btn"><img style="width: 3em;"
          src="/buttons/pause.png"></button>
    </div>

    <div class="info-bar">
      <span>
        <img class="image-label" src="/heart.png">
        <span class="slider"><span :style="`--width: ${game.health.value * 100}%`" /></span>
      </span>
      <span>Level: {{ game.level.value }}</span>
    </div>

    <div class="inventory">
      <div v-for="item in game.inventory.items" class="item"
        :style="`background-image: url(${item ? item.getIcon() : InventoryItem.emptyIcon})`"
        :title="item ? item.getDescription(item.level) : ''">
        <template v-if="item">
          <span class="level">{{ item.displayLevel() }}</span>
        </template>
      </div>
    </div>

    <div class="combat" v-if="game.combats.value">
      <h2>{{ game.combats.value }}</h2>
      <span class="slider"><span :key="game.combats.value" /></span>
    </div>

    <div class="page layout-outter" v-if="game.isPaused">

      <div class="layout" v-if="game.isUpgrading">
        <h1>Upgrade</h1>
        <span>Select an upgrade</span>

        <div class="upgrades">
          <button v-for="item in game.inventory.listUpgrades(3)"
            @click="buttonSound(), game.inventory.addOrUpgrade(item), game.upgrading.value = false">
            <img :src="item.getIcon()" />
            <span>Level: {{ item.displayLevel(true) }}</span>
            <span class="name">{{ item.name }}</span>
            <span>{{ item.getDescription(item.level + (item.has ? 1 : 0)) }}</span>
          </button>
        </div>

      </div>

      <div class="layout" v-else>
        <h1>Menu</h1>
        <div>
          <label><img style="width: 1em;" src="/buttons/volume.png"></label>
          <input type="range" min="0" max="1" step="0.1" v-model="game.volume.value" />
        </div>
        <div class="btns">
          <button @click="buttonSound(), stopGame()" class="icon-btn"><img src="/buttons/back.png"></button>
          <button @click="buttonSound(), restartGame()" class="icon-btn"><img src="/buttons/restart.png"></button>
          <button @click="buttonSound(), game.togglePause()" class="icon-btn"><img src="/buttons/resume.png"></button>
        </div>
      </div>

    </div>

  </div>
  <div class="page" v-else>
    <h1>Game Over</h1>
    <p>Last Level: {{ game.level.value }}</p>
    <p>Max Combat: {{ game.maxCombat }}</p>
    <div class="menu">
      <button @click="buttonSound(), restartGame()" class="icon-btn"><img src="/buttons/restart.png"></button>
      <button @click="buttonSound(), stopGame()" class="icon-btn"><img src="/buttons/back.png"></button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.game {

  //
  & * {
    animation-play-state: inherit !important;
  }

  & .layout-outter {
    backdrop-filter: blur(5px);
    background: color-mix(in srgb, var(--background) 50%, transparent);
  }

  & .layout {

    display: flex;
    flex-direction: column;
    align-items: center;

    & .btns {
      display: flex;
      gap: 1em;
    }
  }

  .menu-bar {
    position: fixed;
    padding: .5em;
    left: 0;
    top: 0;

    display: flex;
    gap: 1em;
    flex-direction: column;

    & button {
      padding: .5em;
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

  .inventory {
    position: fixed;
    bottom: 0.5em;
    left: 0.5em;
    padding: .2em;
    display: flex;
    border-radius: .2em;
    gap: .2em;
    background: var(--background);

    & .item {
      width: 2em;
      height: 2em;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      position: relative;

      .level {
        position: absolute;
        right: .2em;
        bottom: 0;
        font-size: .5em;
      }

      &:hover {
        filter: brightness(1.2);
        transition: filter .3s;
      }
    }
  }

  .combat {
    display: flex;
    flex-direction: column;
    transform: translate(-50%, 0);
    color: var(--danger);
    position: fixed;
    left: 50%;

    & h2 {
      text-align: center;
      font-size: 2em;
      margin: 0;
    }

    & .slider {
      width: 5em;
      height: .5em;
      overflow: hidden;
      border-radius: .5em;
      display: inline-block;
      background: var(--color);

      & span {
        width: 100%;
        height: 100%;
        display: block;
        background: var(--danger);
        animation: left 3s linear;

        @keyframes left {
          0% {
            width: 100%;
          }

          100% {
            width: 0;
          }
        }
      }
    }


  }

  & .upgrades {
    display: flex;
    gap: 1em;
    margin: 0 1em;

    & button {
      max-width: 18em;
      padding: 1.2em;
      background: var(--background);

      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: space-between;
      gap: .6em;

      img {
        object-fit: contain;
        display: block;
        height: 8em;
        width: 8em;
      }

      .name {
        margin-top: 1em;
        font-size: 1.2em;
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
  top: 0;
  width: 100vw;
  height: 100vh;
  position: fixed;
  text-align: center;

  & .menu {
    gap: 1rem;
    margin: auto;
    display: flex;
    width: fit-content;
    flex-direction: column;

    & button {
      border: var(--color) 2px solid;
      padding: 0.2em 1em;
    }
  }

  background: url('/background.gif'), #6DB3F2;
  background-size: cover;

  &>* {
    text-shadow: 0 0 1em var(--background);
  }

  fieldset {
    margin: 1em auto;
    padding: 1em;
    border: var(--color) 2px solid;
    border-radius: .5em;
    width: 80%;
    max-width: 30em;

    background: color-mix(in srgb, var(--background) 80%, transparent);
    text-shadow: none !important;

    & legend {
      color: var(--background);
      background: var(--color);
      border-radius: .4em;
      text-align: left;
      padding: 0 .4em;
    }
  }
}

.icon-btn {
  padding: 0 !important;
  border: none !important;
  background: none !important;

  & img {
    width: 10em;
  }
}
</style>