import { createApp, ref, watch } from 'vue'
import App from "./App.vue"
import './style.scss'
import { Controller } from './modules/controller'
import { Render, ViewPort } from './modules/render'
import { Player } from './objects/player'
import { Enemy } from './objects/enemy'
import { Timers } from './modules/utils'
import { Bullet } from './objects/bullet'
import { FireMan } from './objects/enemies/fireman'
import { Slime } from './objects/enemies/slime'
import { Dog } from './objects/enemies/dog'
import { audioManager } from './modules/audios'

createApp(App).mount('#ui')


export class Game {

  prepare() {
    this.controller.reset()
  }

  runMain(_delta = 0, mouse: [number, number]) {

    // check if level is cleared
    if (this.enemies.size === 0) {
      //upgrage
      if (this.level.value > 0) {
        this.upgrading.value = true
        audioManager.play("level-up")

        const paused = this.isPaused
        if (paused) return

        this.pause()
        const unwatch = watch(this.upgrading, value => {
          if (value) return
          if (this.isRunning) this.resume()
          unwatch()
        })
      }

      // level 
      const level = ++this.level.value
      const places = new Array(16 * 9).fill(0).map((_, i) => [i % 16 - 8, Math.floor(i / 16) - 4.5])
      for (let i = 0; i < level * 2; i++) {
        const placesLeft = places.length
        const place = places.splice(Math.floor(placesLeft * Math.random()), 1)[0]
        const offsetX = 32 + Math.random() * (100 - 64)
        const offsetY = 32 + Math.random() * (100 - 64)
        const x = offsetX + place[0] * 100
        const y = offsetY + place[1] * 100

        const enemy = [
          () => new Slime(this, [x, y]),
          () => new FireMan(this, [x, y]),
          () => new Dog(this, [x, y]),
        ][Math.floor(Math.random() * 3)]()

        this.enemies.add(enemy)
      }
    }

    this.player.control(mouse, this.controller.click())
    this.health.value = this.player.health.percent()

    if (this.timers.done("combats")) this.combats.value = 0
    else this.maxCombat = Math.max(this.maxCombat, this.combats.value)
  }

  //game data
  level = ref(0)
  health = ref(1)
  combats = ref(0)
  upgrading = ref(false)
  maxCombat = 0
  player: Player
  enemies = new Set<Enemy>()
  bullets = new Set<Bullet>()
  timers = new Timers()


  //game process meta
  idRecord = 0
  paused = ref(false)
  running = ref(false)
  volume = ref(0.5)
  bgm: AudioBufferSourceNode | undefined = undefined
  viewport = new ViewPort([1600, 900]);

  constructor(
    private controller: Controller,
    private render: Render,
  ) {
    this.player = new Player(this)


  }

  run(delta = 0) {
    // request next frame
    if (!this.prepareNextFrame(delta)) return

    const mouse = this.render.mapFromScreen(this.controller.mouse, this.viewport)
    this.runMain(delta, mouse)

    if (this.player.destoryed) {
      this.stop()
      return
    }

    // record render object
    for (const object of [this.player, ...this.enemies, ...this.bullets]) {
      if (object.destoryed) {
        this[object instanceof Bullet ? "bullets" : "enemies"].delete(object as Bullet & Enemy)
        continue
      }

      object.next(delta)
      this.viewport.add(object)
    }

    this.render.draw(delta, this.viewport)
    this.timers.tick(delta)
  }

  prepareNextFrame(delta: number) {
    if (this.isPaused) return false

    const old = performance.now()
    requestAnimationFrame(() => {
      const now = performance.now()
      this.run(now - old)
    })

    // skip if delta equals 0, to avoid unnecessary calculations
    if (delta === 0) return false

    return true
  }

  togglePause() {
    if (this.isPaused) this.resume()
    else this.pause()
  }

  pause() {
    if (!this.isRunning) return
    this.paused.value = true
  }

  resume() {
    if (!this.isRunning) return
    this.paused.value = false
    this.controller.reset()
    this.run()
  }

  async start() {
    this.running.value = true
    watch(this.volume, value => audioManager.setVolume(value))
    this.bgm = audioManager.get("bgm")
    this.bgm.loop = true
    this.bgm.start(0,1.5)
    this.prepare()
    this.run()
  }

  stop() {
    if (!this.isRunning) return
    this.running.value = false
    if (this.bgm) this.bgm.stop()
    console.log("Game Over")
    this.render.clear()
  }

  combat() {
    this.timers.record("combats", 3000)
    this.combats.value++
  }

  get inventory() {
    return this.player.inventorySystem
  }

  get isUpgrading() {
    return this.upgrading.value
  }
  get isPaused() {
    return this.paused.value || !this.running.value
  }
  get isRunning() {
    return this.running.value
  }

}
