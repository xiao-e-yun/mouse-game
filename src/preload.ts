import { bitmapManager } from './modules/texture'
import { audioManager } from './modules/audios'
import { reactive } from 'vue'

export function preload() {
  const result = reactive({
    total: loadAudios.length + loadedBitmaps.length,
    loaded: 0,
    ready: false,
    preloadList: [] as Promise<unknown>[],
  })

  for (const [audioName, audioSrc] of loadAudios) {
    const audio = audioManager.load(audioName, audioSrc).then(() => result.loaded++)
    result.preloadList.push(audio)
  }

  for (const bitmapSrc of loadedBitmaps) {
    const bitmap = bitmapManager.load(bitmapSrc).then(() => result.loaded++)
    result.preloadList.push(bitmap)
  }

  Promise.all(result.preloadList).then(() => result.ready = true)
  return result
}

import Bgm from '/sounds/bgm.mp3'
import Attack1Sound from '/sounds/attack1.mp3'
import Attack2Sound from '/sounds/attack2.mp3'
import ButtonSound from '/sounds/button.mp3'
import LevelUpSound from '/sounds/level-up.mp3'
import ShieldResotreSound from '/sounds/shield-restore.mp3'
import ShieldBreakSound from '/sounds/shield-break.mp3'
const loadAudios = [
  ["bgm", Bgm],
  ["attack1", Attack1Sound],
  ["attack2", Attack2Sound],
  ["button", ButtonSound],
  ["level-up", LevelUpSound],
  ["shield-resotre", ShieldResotreSound],
  ["shield-break", ShieldBreakSound],
] as [string, string][]


// other images
import PlayerImage from '@bitmaps/player.png'
import DefaultImage from '@bitmaps/default.webp'
import BackgroundImage from '@bitmaps/background.png'
// enemies
import SlimeImage from '@bitmaps/enemies/slime.png'
import DogImage from '@bitmaps/enemies/dog.png'
import FireManImage from '@bitmaps/enemies/fireman.png'
// bullet
import FireBallImage from '@bitmaps/bullets/fireball.png'
import RockImage from '@bitmaps/bullets/rock.png'
import BombImage from '@bitmaps/bullets/bomb.png'
import BombBoomImage from '@bitmaps/bullets/bomb-boom.png'
// items
import ShieldImage from '@bitmaps/items/shield.png'
// for preload
export const loadedBitmaps = [PlayerImage, DefaultImage, BackgroundImage, SlimeImage, DogImage, FireManImage, FireBallImage, RockImage, ShieldImage,BombImage,BombBoomImage]