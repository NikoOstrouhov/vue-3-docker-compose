<template>
  <div class="game" ref="game" @mousemove="(e) => comMouseMove(e)">
    <div class="game__hud">
      <div class="game__text">Время: {{ getFormattedTime }} </div>
      <div class="game__text--coins">Монеты: {{ getCoins }} </div>
      <div class="game__text">Урон игрока:  {{ getPlayerDamage }} </div>
      <div class="game__health-bar">
        <div class="game__health-label">
          {{ Math.ceil(getPlayer.health) }} / {{ getPlayer.maxHealth }} HP
        </div>
        <div class="game__health-fill" :style="{ width: getHealthPercent + '%' }"></div>
      </div>
      <div class="game__health-bar">
        <div class="game__health-label">
          {{ Math.ceil(getPlayer.mana) }} / {{ getPlayer.maxMana }} MP
        </div>
        <div class="game__mana-fill" :style="{ width: getManaPercent + '%' }"></div>
      </div>
    </div>

    <div 
      class="game__world"
      :style="{ transform:`translate(${-getCamera.x}px, ${-getCamera.y}px)`}"
    >
      <div
        class="game__player"
        :style="{
          left: getPlayer.x + 'px',
          top: getPlayer.y + 'px'
        }"
      ></div>
      <div
        v-for="b in getBullets"
        :key="b.id"
        class="game__bullet"
        :style="{
          left: b.x + 'px',
          top: b.y + 'px',
          width: b.radius * 2 + 'px',
          height: b.radius * 2 + 'px',
          background: b.color,
        }"
      ></div>
      <template v-for="e in getEffects" :key="e.id">
        <div
          v-if="e.type === 'aoe'"
          class="game__effect game__effect--aoe"
          :style="{
            left: e.x - e.radius + 'px',
            top: e.y - e.radius + 'px',
            width: e.radius * 2 + 'px',
            height: e.radius * 2 + 'px'
          }"
        ></div>
      </template>
      <div
        v-for="e in getEnemies"
        :key="e.id"
        class="game__enemy"
        :class="`game__enemy--${e.type}`"
        :style="{
          left: e.x + 'px',
          top: e.y + 'px',
        }"
      >
        <div class="game__enemy-hp">
          {{ Math.ceil(e.hp) }}
        </div>
      </div>
      <div
        v-for="be in getEnemyBullets"
        :key="be.id"
        class="game__enemy-bullet"
        :style="{
          left: be.x + 'px',
          top: be.y + 'px',
          width: be.radius * 2 + 'px',
          height: be.radius * 2 + 'px',
        }"
      ></div>
    </div>
    <div v-if="!getGameActive" class="game__game-over">
      <h2 class="game__game-over-title">КОНЕЦ ИГРЫ</h2>
      <p class="game__game-over-time">Время: {{ getFormattedTime }}</p>
      <button class="game__button" @click="() => resetGame()">НОВАЯ ИГРА</button>
    </div>
    <div v-if="getGamePaused" class="game__game-paused">
      <h2 class="game__game-paused-title">Пауза</h2>
      <div class="game__text--shop">
        Восстановить HP за {{ getShopItemCost('heal') }} монет
        <button class="game__button" @click="() => buyHeal()">+</button>
      </div>
      <div class="game__text--shop">
        Восстановить MP за {{ getShopItemCost('mana') }} монет
        <button class="game__button" @click="() => buyMana()">+</button>
      </div>
      <div class="game__text--shop">
        Увеличить урон на {{ getShopItemIncrease('damage') }} за {{ getShopItemCost('damage') }} монет
        <button class="game__button" @click="() => upgradeDamage()">+</button>
      </div>
      <div class="game__text--shop">
        Увеличить max HP на {{ getShopItemIncrease('maxHealth') }} за {{ getShopItemCost('maxHealth') }} монет
        <button class="game__button" @click="() => upgradeMaxHealth()">+</button>
      </div>
      <div class="game__text--shop">
        Увеличить max MP на {{ getShopItemIncrease('maxMana') }} за {{ getShopItemCost('maxMana') }} монет
        <button class="game__button" @click="() => upgradeMaxMana()">+</button>
      </div>
      <button class="game__button" @click="() => togglePause()">Возобновить</button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'GameVampires',
  data() {
    return {
      animationFrame: null,
      loop: null,
    }
  },
  computed: {
    ...mapGetters('game', [
      'getPlayer',
      'getGameActive',
      'getBullets',
      'getEnemyBullets',
      'getEnemies',
      'getCamera',
      'getFormattedTime', 
      'getHealthPercent',
      'getManaPercent',
      'getCoins',
      'getGamePaused',
      'getShopItemCost',
      'getPlayerDamage',
      'getShopItemIncrease',
      'getEffects',
    ]),
  },
  mounted() {
    this.loop = (timestamp) => {
      if (this.getGameActive) {
        this.gameLoop(timestamp)
      }
      this.animationFrame = requestAnimationFrame(this.loop)
    }
    this.init()
    window.addEventListener('keydown', this.comKeyDown)
    window.addEventListener('keyup', this.comKeyUp)
    window.addEventListener('resize', this.comResize)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.comKeyDown)
    window.removeEventListener('keyup', this.comKeyUp)
    window.removeEventListener('resize', this.comResize)
    cancelAnimationFrame(this.animationFrame)
  },
  methods: {
    ...mapActions('game', [
      'gameLoop',
      'resetGame',
      'handleKeyDown',
      'handleKeyUp',
      'setMousePosition',
      'setWorldSize',
      'togglePause',
      'buyHeal',
      'buyMana',
      'upgradeDamage',
      'upgradeMaxHealth',
      'upgradeMaxMana',
      'useSpecialAOE',
      'useSpecialHeavyBullet',
    ]),
    comMouseMove(e) {
      const rect = this.$refs.game.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      this.setMousePosition({ x, y })
    },
    comKeyDown(e) {
      if (e.key.startsWith('Arrow')) {
        e.preventDefault()
      }
      if (e.key === 'Escape' || e.key === 'P' || e.key === 'p' || e.key === 'з' || e.key === 'З') {
        e.preventDefault()
        this.togglePause()
      }
      if (e.key === 'q' || e.key === 'Q' || e.key === 'й' || e.key === 'Й') {
        e.preventDefault()
        this.useSpecialAOE()
      }
      if (e.key === 'e' || e.key === 'E' || e.key === 'у' || e.key === 'У') {
        e.preventDefault()
        this.useSpecialHeavyBullet()
      }
      this.handleKeyDown(e)
    },
    comKeyUp(e) {
      if (e.key.startsWith('Arrow')) {
        e.preventDefault()
      }
      this.handleKeyUp(e)
    },
    comResize() {
      const width = window.innerWidth
      const height = window.innerHeight
      this.setWorldSize({ width, height })
    },
    init() {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = requestAnimationFrame(this.loop)
    },
  },
}
</script>

<style scoped lang="scss">
.game {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #308815;
  &__hud {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    color: #fff;
    font-family: monospace;
    font-size: 18px;
    background: rgba(0, 0, 0, 0.7);
    padding: 10px 20px;
    border-radius: 5px;
    border: 1px solid #444;
  }
  &__world {
    position: absolute;
    left: 0;
    top: 0;
    will-change: transform;
  }
  &__text {
    margin-bottom: 5px;
    color: #aaa;
    &--shop {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 80px;
      margin: 10px 0;
    }
    &--coins {
      color: #ffd700;
    }
  }
  &__health-bar {
    width: 200px;
    height: 25px;
    background-color: #000000;
    border: 1px solid #7d7d7d;
    border-radius: 3px;
    overflow: hidden;
    position: relative;
  }
  &__health-label {
    position: absolute;
    width: 100%;
    text-align: center;
    line-height: 23px;
    z-index: 2;
    color: #fff;
    font-size: 14px;
  }
  &__health-fill {
    height: 100%;
    background-color: #4caf50;
    transition: width 0.1s;
  }
  &__mana-fill {
    height: 100%;
    background-color: #00bfff;
    transition: width 0.1s;
  }
  &__player {
    position: absolute;
    width: 40px;
    height: 40px;
    background-color: #0080ff;
    border: 2px solid #ffffff;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    will-change: left, top;
    z-index: 2;
  }
  &__bullet {
    position: absolute;
    width: 8px;
    height: 8px;
    background: #e5ff00;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    will-change: left, top;
  }
  &__enemy-bullet {
    position: absolute;
    background: #ff0000;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    will-change: left, top;
  }
  &__enemy {
    position: absolute;
    width: 32px;
    height: 32px;
    background: #00ffd9;
    border: 2px solid #ffffff;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    will-change: left, top;
    z-index: 2;
    &--pawn {
      background: #ff0000;
    }
    &--fast {
      width: 25px;
      height: 25px;
      background: #ffaa00;
    }
    &--tank {
      width: 52px;
      height: 52px;
      background: #00058b;
    }
    &--ranged {
      background: #9d08d3;
    }
  }
  &__enemy-hp {
    position: absolute;
    left: 50%;
    top: -30px;
    padding: 1px 3px;
    border-radius: 5px;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.75);
    color: #fff;
    font-size: 13px;
    font-family: monospace;
    pointer-events: none;
  }  
  &__game-over {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.9);
    padding: 30px 50px;
    border-radius: 5px;
    text-align: center;
    color: #fff;
    z-index: 20;
    border: 2px solid #ff0000;
  }
  &__game-paused {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 600px;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.9);
    padding: 50px 80px;
    border-radius: 5px;
    color: #fff;
    text-align: left;
    z-index: 20;
    border: 2px solid #ff0000;
    display: flex;
    flex-direction: column;
  }
  &__game-paused-title {
    text-align: center;
    font-size: 36px;
    margin-bottom: 20px;
    color: #ff0000;
  }
  &__effect {
    position: absolute;
    pointer-events: none;
    z-index: 1;
    &--aoe {
      border-radius: 50%;
      background: #ff0000;
    }
  }
  &__game-over-title {
    font-size: 36px;
    margin-bottom: 15px;
    color: #ff0000;
  }
  &__game-over-time {
    font-size: 18px;
    margin-bottom: 20px;
    font-family: monospace;
  }
  &__button {
    padding: 10px 30px;
    font-size: 16px;
    background: #4caf50;
    color: #fff;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-weight: bold;
    &:hover {
      background: #45a049;
    }
  }
}
</style>