import { createApp, ref } from 'vue'
import App from "./App.vue"
import './style.scss'
import { Controller } from './modules/controller'
import { Render, ViewPort } from './modules/render'
import { Player } from './objects/player'
import { Enemy } from './objects/enemy'

createApp(App).mount('#ui')

export class Game {

  prepare() {
  }

  run(delta = 0) {

    // request next frame
    if (!this.prepareNextFrame(delta)) return

     // level 
    if (this.#enemies.size===0){
      const level = ++this.level.value
      const places = new Array(16*9).fill(0).map((_,i)=>[i%16-8,Math.floor(i/16)-4.5])
      for (let i = 0; i < level * 2; i++) {
        const placesLeft = places.length
        const place = places.splice(Math.floor(placesLeft * Math.random()),1)[0]
        const offsetX = 32 + Math.random() * (100 - 64)
        const offsetY = 32 + Math.random() * (100 - 64)
        const x = offsetX + place[0] * 100
        const y = offsetY + place[1] * 100 
        this.#enemies.add(new Enemy([x, y]))
      }
    }

    const mousePos = this.render.mapFromScreen(this.controller.mouse)
    this.#player.position = this.viewport.mapToViewport(mousePos)
    this.health.value = this.#player.health
    this.#player.next(delta)
    this.viewport.add(this.#player)

    const newAttacked = new Set<Enemy>()
    for (const enemy of this.#enemies) {
      enemy.next(delta)

      const attack = enemy.attack()
      
      if (this.#player.collision(enemy)) {
        newAttacked.add(enemy)
        if (!this.#attacked.has(enemy))
          enemy.damaged(10)

        if (attack) {
          this.#player.damaged(attack)
        }
      }

      if (enemy.destoryed)
        this.#enemies.delete(enemy)
      else
        this.viewport.add(enemy)
    }
    this.#attacked = newAttacked

    this.render.draw(delta, this.viewport)

  }

  //game data
  level = ref(0)
  health = ref(100)
  #player = new Player()
  #enemies = new Set<Enemy>()
  #attacked = new Set<Enemy>()

  //game process meta
  paused = ref(false)
  running = ref(false)
  viewport = new ViewPort([1600, 900]);

  constructor(
    private controller: Controller,
    private render: Render,
  ) {

  }

  prepareNextFrame(delta: number) {
    if (this.isPaused || !this.isRunning) return false

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
    if (!this.isRunning) return
    this.paused.value = !this.isPaused
    if (!this.isPaused) this.run()
  }

  start() {
    this.running.value = true
    this.prepare()
    this.run()
  }

  stop() {
    this.running.value = false
    this.render.clear()
  }

  get isPaused() {
    return this.paused.value
  }
  get isRunning() {
    return this.running.value
  }

}
