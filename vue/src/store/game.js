const MUTATIONS = {
  SET_PLAYER_POSITION: 'SET_PLAYER_POSITION',
  SET_KEY: 'SET_KEY',
  UPDATE_GAME_TIME: 'UPDATE_GAME_TIME',
  UPDATE_PLAYER_HEALTH: 'UPDATE_PLAYER_HEALTH',
  UPDATE_PLAYER_MANA: 'UPDATE_PLAYER_MANA',
  RESET_GAME: 'RESET_GAME',
  TOGGLE_PAUSE: 'TOGGLE_PAUSE',
  BUY_HEAL: 'BUY_HEAL',
  BUY_MANA: 'BUY_MANA',
  UPGRADE_DAMAGE: 'UPGRADE_DAMAGE',
  UPGRADE_MAX_HEALTH: 'UPGRADE_MAX_HEALTH',
  UPGRADE_MAX_MANA: 'UPGRADE_MAX_MANA',
  SET_LAST_TIME: 'SET_LAST_TIME',
  SET_WORLD_SIZE: 'SET_WORLD_SIZE',
  SET_CAMERA: 'SET_CAMERA',
  SET_MOUSE_POS: 'SET_MOUSE_POS',
  SPAWN_BULLET: 'SPAWN_BULLET',
  MOVE_BULLETS: 'MOVE_BULLETS',
  REMOVE_BULLET_IDS: 'REMOVE_BULLET_IDS',
  REMOVE_OUTSIDE_BULLETS: 'REMOVE_OUTSIDE_BULLETS',
  DEC_FIRE_COOLDOWN: 'DEC_FIRE_COOLDOWN',
  SET_FIRE_COOLDOWN: 'SET_FIRE_COOLDOWN',
  SET_NEXT_BULLET_ID: 'SET_NEXT_BULLET_ID',
  SPAWN_ENEMY: 'SPAWN_ENEMY',
  MOVE_ENEMIES: 'MOVE_ENEMIES',
  DAMAGE_ENEMY: 'DAMAGE_ENEMY',
  REMOVE_DEAD_ENEMIES: 'REMOVE_DEAD_ENEMIES',
  DEC_SPAWN_COOLDOWN: 'DEC_SPAWN_COOLDOWN',
  SET_SPAWN_COOLDOWN: 'SET_SPAWN_COOLDOWN',
  SET_NEXT_ENEMY_ID: 'SET_NEXT_ENEMY_ID',
  SPAWN_ENEMY_BULLET: 'SPAWN_ENEMY_BULLET',
  MOVE_ENEMY_BULLETS: 'MOVE_ENEMY_BULLETS',
  REMOVE_ENEMY_BULLET_IDS: 'REMOVE_ENEMY_BULLET_IDS',
  REMOVE_OUTSIDE_ENEMY_BULLETS: 'REMOVE_OUTSIDE_ENEMY_BULLETS',
  SET_NEXT_ENEMY_BULLET_ID: 'SET_NEXT_ENEMY_BULLET_ID',
  USE_SPECIAL_AOE: 'USE_SPECIAL_AOE',
  USE_SPECIAL_HEAVY_BULLET: 'USE_SPECIAL_HEAVY_BULLET',
  DEC_SPECIAL_COOLDOWNS: 'DEC_SPECIAL_COOLDOWNS',
  SPAWN_EFFECT: 'SPAWN_EFFECT',
  UPDATE_EFFECTS: 'UPDATE_EFFECTS',
  REMOVE_EFFECT_IDS: 'REMOVE_EFFECT_IDS',
}
const SHOP_ITEMS = {
  heal: {
    type: 'consumable',
    cost: 20,
  },
  mana: {
    type: 'consumable',
    cost: 15,
  },
  damage: {
    type: 'upgrade',
    Increase: 15,
    baseCost: 30,
    stepCost: 20,
  },
  maxHealth: {
    type: 'upgrade',
    Increase: 20,
    baseCost: 40,
    stepCost: 25,
  },
  maxMana: {
    type: 'upgrade',
    Increase: 20,
    baseCost: 35,
    stepCost: 20,
  },
}
const SPECIAL_ATTACKS = {
  aoe: {
    manaCost: 30,
    damage: 50,
    radius: 150,
    maxCooldown: 5,
  },
  heavyShotBullet: {
    manaCost: 40,
    damage: 100,
    bulletSpeed: 800,
    bulletRadius: 100,
    maxCooldown: 5,
    penetration: true
  }
}
const ENEMY_TYPES = {
  pawn: {
    hp: 30,
    speed: 120,
    radius: 16,
    damage: 15,
    reward: 2
  },
  fast: {
    hp: 18,
    speed: 190,
    radius: 13,
    damage: 10,
    reward: 1
  },
  tank: {
    hp: 80,
    speed: 70,
    radius: 26,
    damage: 25,
    reward: 3
  },
  ranged: {
    hp: 22,
    speed: 110,
    radius: 15,
    damage: 5,
    reward: 2,
    preferredDistance: 450,
    minDistance: 400,
    maxDistance: 600,
    fireRate: 1.2,
    shootDistance: 470,
    bulletSpeed: 360,
    bulletRadius: 5,
    bulletDamage: 8,
  },
}
const pickEnemyType = () => {
  const roll = Math.random()
  switch (true) {
    case roll < 0.5:
      return 'ranged'
    case roll < 0.6:
      return 'pawn'
    case roll < 0.8:
      return 'fast'
    default:
      return 'tank'
  }
}
const getVectorToPlayer = (enemy, state) => {
  const dx = state.player.x - enemy.x
  const dy = state.player.y - enemy.y
  const len = Math.hypot(dx, dy) || 1
  return {
    dx,
    dy,
    len,
    nx: dx / len,
    ny: dy / len,
  }
}
const moveTowards = (enemy, targetX, targetY, speed, dt) => {
  const dx = targetX - enemy.x
  const dy = targetY - enemy.y
  const len = Math.hypot(dx, dy) || 1
  enemy.x += (dx / len) * speed * dt
  enemy.y += (dy / len) * speed * dt
}
const moveAway = (enemy, targetX, targetY, speed, dt) => {
  const dx = targetX - enemy.x
  const dy = targetY - enemy.y
  const len = Math.hypot(dx, dy) || 1
  enemy.x -= (dx / len) * speed * dt
  enemy.y -= (dy / len) * speed * dt
}
const updatePawnEnemy = (enemy, state, dt) => {
  moveTowards(enemy, state.player.x, state.player.y, enemy.speed, dt)
}
const updateFastEnemy = (enemy, state, dt) => {
  moveTowards(enemy, state.player.x, state.player.y, enemy.speed, dt)
}
const updateTankEnemy = (enemy, state, dt) => {
  moveTowards(enemy, state.player.x, state.player.y, enemy.speed, dt)
}
const updateRangedEnemy = (enemy, state, dt) => {
  const { len } = getVectorToPlayer(enemy, state)
  const minDistance = enemy.minDistance ?? 180
  const maxDistance = enemy.maxDistance ?? 420
  const preferredDistance = enemy.preferredDistance ?? 280
  if (len < minDistance) {
    moveAway(enemy, state.player.x, state.player.y, enemy.speed, dt)
    return
  }
  if (len > maxDistance) {
    moveTowards(enemy, state.player.x, state.player.y, enemy.speed, dt)
    return
  }
  const delta = len - preferredDistance
  if (Math.abs(delta) < 16) {
    return
  }
  const correctionSpeed = enemy.speed * 0.35
  if (delta > 0) {
    moveTowards(enemy, state.player.x, state.player.y, correctionSpeed, dt)
    return
  }
  moveAway(enemy, state.player.x, state.player.y, correctionSpeed, dt)
}
const enemyBehaviors = {
  pawn: updatePawnEnemy,
  fast: updateFastEnemy,
  tank: updateTankEnemy,
  ranged: updateRangedEnemy,
}
const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
const dist2 = (ax, ay, bx, by) => {
  const dx = ax - bx
  const dy = ay - by
  return dx * dx + dy * dy
}
const spawnAtViewportEdge = (state) => {
  const { width: w, height: h } = state.world
  const { x: cx, y: cy } = state.camera
  const pad = 40
  switch (Math.floor(Math.random() * 4)) {
    case 0:
      return { x: cx + Math.random() * w, y: cy - pad }
    case 1:
      return { x: cx + w + pad, y: cy + Math.random() * h }
    case 2:
      return { x: cx + Math.random() * w, y: cy + h + pad }
    default:
      return { x: cx - pad, y: cy + Math.random() * h }
  }
}
export default {
  namespaced: true,
  state: {
    world: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    player: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      health: 100,
      maxHealth: 100,
      speed: 300,
      radius: 20,
      coins: 100000,
      mana: 0,
      maxMana: 100,
      manaRegen: 0.5,
    },
    fire: {
      enabled: true,
      rate: 6,
      cooldown: 0,
      bulletSpeed: 700,
      bulletRadius: 4,
      damage: 10,
      penetration: false
    },
    specialAttacks: {
      aoe: {
        enabled: true,
        cooldown: 0,
      },
      heavyShotBullet: {
        enabled: true,
        cooldown: 0,
      }
    },
    effects: [],
    nextEffectId: 1,
    shop: {
      upgradeLevels: {
        damageLevel: 0,
        maxHealthLevel: 0,
        maxManaLevel: 0,
      },
    },
    camera: {
      x: 0,
      y: 0,
    },
    mouse: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    },
    bullets: [],
    nextBulletId: 1,
    enemyBullets: [],
    nextEnemyBulletId: 1,
    enemyFire: {
      bulletDamage: 8,
      bulletSpeed: 360,
      bulletRadius: 5,
    },
    enemies: [],
    nextEnemyId: 1,
    spawner: {
      enabled: true,
      rate: 1.2,
      cooldown: 0,
    },
    contact: {
      dps: 2,
    },
    gameTime: 0,
    lastTimestamp: 0,
    keys: {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
    },
    gameActive: true,
    gamePaused: false,
    gameOver: false
  },
  getters: {
    getPlayer: (state) => state.player,
    getCamera: (state) => state.camera,
    getBullets: (state) => state.bullets,
    getEffects: (state) => state.effects,
    getEnemyBullets: (state) => state.enemyBullets,
    getEnemies: (state) => state.enemies,
    getGameActive: (state) => state.gameActive,
    getGamePaused: (state) => state.gamePaused,
    getFormattedTime: (state) => {
      const minutes = Math.floor(state.gameTime / 60)
      const seconds = Math.floor(state.gameTime % 60)
      const milliseconds = Math.floor((state.gameTime * 100) % 100)
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`
    },
    getHealthPercent: (state) => (state.player.health / state.player.maxHealth) * 100,
    getManaPercent: (state) => (state.player.mana / state.player.maxMana) * 100,
    getCoins: (state) => state.player.coins,
    getPlayerDamage: (state) => state.fire.damage,
    getShopItemCost: (state) => (itemKey) => {
      const item = SHOP_ITEMS[itemKey]
      if (!item) {
        return 123
      }
      if (item.type === 'consumable') {
        return item.cost
      }
      const level = state.shop.upgradeLevels[itemKey + 'Level'] || 0
      return item.baseCost + item.stepCost * level
    },
    getShopItemIncrease: (state) => (itemKey) => {
      const item = SHOP_ITEMS[itemKey]
      if (!item) {
        return 123
      }
      if (item.type === 'consumable') {
        return
      }
      const level = state.shop.upgradeLevels[itemKey + 'Level'] || 0
      return item.Increase * (level + 1)
    },
  },
  mutations: {
    [MUTATIONS.SET_WORLD_SIZE]: (state, { width, height }) => {
      state.world.width = width
      state.world.height = height
    },
    [MUTATIONS.SET_PLAYER_POSITION]: (state, { x, y }) => {
      state.player.x = x
      state.player.y = y
    },
    [MUTATIONS.SET_CAMERA]: (state, { x, y }) => {
      state.camera.x = x
      state.camera.y = y
    },
    [MUTATIONS.SET_KEY]: (state, { key, isPressed }) => {
      if (key in state.keys) {
        state.keys[key] = isPressed
      }
    },
    [MUTATIONS.SET_MOUSE_POS]: (state, { x, y }) => {
      state.mouse.x = clamp(x, 0, state.world.width)
      state.mouse.y = clamp(y, 0, state.world.height)
    },
    [MUTATIONS.UPDATE_GAME_TIME]: (state, dt) => {
      if (state.gameActive) {
        state.gameTime += dt
      }
    },
    [MUTATIONS.UPDATE_PLAYER_HEALTH]: (state, newHealth) => {
      state.player.health = Math.max(0, Math.min(state.player.maxHealth, newHealth))
      if (state.player.health <= 0) {
        state.player.health = 0
        state.gameOver = true
        state.gameActive = false
      }
    },
    [MUTATIONS.UPDATE_PLAYER_MANA]: (state, newMana) => {
      state.player.mana = Math.max(0, Math.min(state.player.maxMana, newMana))
    },
    [MUTATIONS.RESET_GAME]: (state) => {
      state.player.x = state.world.width / 2
      state.player.y = state.world.height / 2
      state.player.maxHealth = 100
      state.player.maxMana = 100
      state.player.health = state.player.maxHealth
      state.player.mana = 0
      state.player.coins = 0
      state.mouse.x = state.world.width / 2
      state.mouse.y = state.world.height / 2
      state.camera.x = state.player.x - state.world.width / 2
      state.camera.y = state.player.y - state.world.height / 2
      state.bullets = []
      state.nextBulletId = 1
      state.enemyBullets = []
      state.nextEnemyBulletId = 1
      state.enemies = []
      state.nextEnemyId = 1
      state.specialAttacks.aoe.cooldown = 0
      state.specialAttacks.heavyShotBullet.cooldown = 0
      state.fire.cooldown = 0
      state.fire.damage = 10
      state.spawner.cooldown = 0
      state.gameTime = 0
      state.gamePaused = false
      state.gameOver = false
      state.gameActive = true
      state.lastTimestamp = 0
      state.shop.upgradeLevels = {
        damageLevel: 0,
        maxHealthLevel: 0,
        maxManaLevel: 0,
      }
      for (const k in state.keys) {
        state.keys[k] = false
      }
    },
    [MUTATIONS.TOGGLE_PAUSE]: (state) => {
      if (!state.gameOver) {
        state.gamePaused = !state.gamePaused
      }
    },
    [MUTATIONS.SET_LAST_TIME]: (state, timestamp) => {
      state.lastTimestamp = timestamp
    },
    [MUTATIONS.SPAWN_BULLET]: (state, bullet) => {
      state.bullets.push(bullet)
    },
    [MUTATIONS.MOVE_BULLETS]: (state, dt) => {
      for (const b of state.bullets) {
        b.x += b.vx * dt
        b.y += b.vy * dt
      }
    },
    [MUTATIONS.REMOVE_BULLET_IDS]: (state, ids) => {
      if (!ids || ids.length === 0) {
        return
      }
      const set = new Set(ids)
      state.bullets = state.bullets.filter((b) => !set.has(b.id))
    },
    [MUTATIONS.REMOVE_OUTSIDE_BULLETS]: (state) => {
      const pad = 60
      const w = state.world.width
      const h = state.world.height
      const cx = state.camera.x
      const cy = state.camera.y
      state.bullets = state.bullets.filter((b) => {
        const sx = b.x - cx
        const sy = b.y - cy
        return sx > -pad && sx < w + pad && sy > -pad && sy < h + pad
      })
    },
    [MUTATIONS.DEC_FIRE_COOLDOWN]: (state, dt) => {
      state.fire.cooldown = Math.max(0, state.fire.cooldown - dt)
    },
    [MUTATIONS.SET_FIRE_COOLDOWN]: (state, value) => {
      state.fire.cooldown = Math.max(0, value)
    },
    [MUTATIONS.SET_NEXT_BULLET_ID]: (state, value) => {
      state.nextBulletId = value
    },
    [MUTATIONS.SPAWN_ENEMY]: (state, enemy) => {
      state.enemies.push(enemy)
    },
    [MUTATIONS.MOVE_ENEMIES]: (state, dt) => {
      for (const enemy of state.enemies) {
        const behavior = enemyBehaviors[enemy.type] || updatePawnEnemy
        behavior(enemy, state, dt)
      }
    },
    [MUTATIONS.SPAWN_ENEMY_BULLET]: (state, bullet) => {
      state.enemyBullets.push(bullet)
    },
    [MUTATIONS.MOVE_ENEMY_BULLETS]: (state, dt) => {
      for (const b of state.enemyBullets) {
        b.x += b.vx * dt
        b.y += b.vy * dt
      }
    },
    [MUTATIONS.REMOVE_ENEMY_BULLET_IDS]: (state, ids) => {
      if (!ids || ids.length === 0) {
        return
      }
      const set = new Set(ids)
      state.enemyBullets = state.enemyBullets.filter((b) => !set.has(b.id))
    },
    [MUTATIONS.REMOVE_OUTSIDE_ENEMY_BULLETS]: (state) => {
      const pad = 60
      const w = state.world.width
      const h = state.world.height
      const cx = state.camera.x
      const cy = state.camera.y

      state.enemyBullets = state.enemyBullets.filter((b) => {
        const sx = b.x - cx
        const sy = b.y - cy
        return sx > -pad && sx < w + pad && sy > -pad && sy < h + pad
      })
    },
    [MUTATIONS.SET_NEXT_ENEMY_BULLET_ID]: (state, value) => {
      state.nextEnemyBulletId = value
    },
    [MUTATIONS.DAMAGE_ENEMY]: (state, { id, damage }) => {
      const e = state.enemies.find((x) => x.id === id)
      if (!e) {
        return
      }
      e.hp -= damage
    },
    [MUTATIONS.REMOVE_DEAD_ENEMIES]: (state) => {
      for (const e of state.enemies) {
        if (e.hp <= 0) {
          state.player.coins += e.reward
        }
      }
      state.enemies = state.enemies.filter((e) => e.hp > 0)
    },
    [MUTATIONS.DEC_SPAWN_COOLDOWN]: (state, dt) => {
      state.spawner.cooldown = Math.max(0, state.spawner.cooldown - dt)
    },
    [MUTATIONS.SET_SPAWN_COOLDOWN]: (state, value) => {
      state.spawner.cooldown = Math.max(0, value)
    },
    [MUTATIONS.SET_NEXT_ENEMY_ID]: (state, value) => {
      state.nextEnemyId = value
    },
    [MUTATIONS.BUY_HEAL]: (state) => {
      const cost = SHOP_ITEMS.heal.cost
      if (state.player.coins < cost || state.player.health === state.player.maxHealth) {
        return
      }
      state.player.coins -= cost
      state.player.health = state.player.maxHealth
    },
    [MUTATIONS.BUY_MANA]: (state) => {
      const cost = SHOP_ITEMS.mana.cost
      if (state.player.coins < cost || state.player.mana === state.player.maxMana) {
        return
      }
      state.player.coins -= cost
      state.player.mana = state.player.maxMana
    },
    [MUTATIONS.UPGRADE_DAMAGE]: (state) => {
      const level = state.shop.upgradeLevels.damageLevel
      const cost = SHOP_ITEMS.damage.baseCost + SHOP_ITEMS.damage.stepCost * level
      if (state.player.coins < cost) {
        return
      }
      state.player.coins -= cost
      state.shop.upgradeLevels.damageLevel++
      state.fire.damage = state.fire.damage + state.shop.upgradeLevels.damageLevel * SHOP_ITEMS.damage.Increase
    },
    [MUTATIONS.UPGRADE_MAX_HEALTH]: (state) => {
      const level = state.shop.upgradeLevels.maxHealthLevel
      const cost = SHOP_ITEMS.maxHealth.baseCost + SHOP_ITEMS.maxHealth.stepCost * level
      if (state.player.coins < cost) {
        return
      }
      state.player.coins -= cost
      state.shop.upgradeLevels.maxHealthLevel++
      state.player.maxHealth = state.player.maxHealth + state.shop.upgradeLevels.maxHealthLevel * SHOP_ITEMS.maxHealth.Increase
    },
    [MUTATIONS.UPGRADE_MAX_MANA]: (state) => {
      const level = state.shop.upgradeLevels.maxManaLevel
      const cost = SHOP_ITEMS.maxMana.baseCost + SHOP_ITEMS.maxMana.stepCost * level
      if (state.player.coins < cost) {
        return
      }
      state.player.coins -= cost
      state.shop.upgradeLevels.maxManaLevel++
      state.player.maxMana = state.player.maxMana + state.shop.upgradeLevels.maxManaLevel * SHOP_ITEMS.maxHealth.Increase
    },
    [MUTATIONS.DEC_SPECIAL_COOLDOWNS]: (state, dt) => {
      state.specialAttacks.aoe.cooldown = Math.max(0, state.specialAttacks.aoe.cooldown - dt)
      state.specialAttacks.heavyShotBullet.cooldown = Math.max(0, state.specialAttacks.heavyShotBullet.cooldown - dt)
    },
    [MUTATIONS.USE_SPECIAL_AOE]: (state) => {
      state.player.mana -= SPECIAL_ATTACKS.aoe.manaCost
      state.specialAttacks.aoe.cooldown = SPECIAL_ATTACKS.aoe.maxCooldown
    },
    [MUTATIONS.USE_SPECIAL_HEAVY_BULLET]: (state) => {
      state.player.mana -= SPECIAL_ATTACKS.heavyShotBullet.manaCost
      state.specialAttacks.heavyShotBullet.cooldown = SPECIAL_ATTACKS.heavyShotBullet.maxCooldown
    },
    [MUTATIONS.SPAWN_EFFECT]: (state, effect) => {
      state.effects.push(effect)
    },
    [MUTATIONS.UPDATE_EFFECTS]: (state, dt) => {
      for (const e of state.effects) {
        if (e.followPlayer) {
          e.x = state.player.x
          e.y = state.player.y
        }
        e.life -= dt
      }
    },
    [MUTATIONS.REMOVE_EFFECT_IDS]: (state) => {
      state.effects = state.effects.filter(e => e.life > 0)
    },
  },
  actions: {
    handleKeyDown: ({ commit }, event) => {
      commit(MUTATIONS.SET_KEY, { key: event.key, isPressed: true })
    },
    handleKeyUp: ({ commit }, event) => {
      commit(MUTATIONS.SET_KEY, { key: event.key, isPressed: false })
    },
    setMousePosition: ({ commit }, pos) => {
      commit(MUTATIONS.SET_MOUSE_POS, pos)
    },
    setWorldSize: ({ state, commit }, size) => {
      commit(MUTATIONS.SET_WORLD_SIZE, size)
      commit(MUTATIONS.SET_CAMERA, {
        x: state.player.x - size.width / 2,
        y: state.player.y - size.height / 2,
      })
    },
    updatePlayerPosition: ({ state, commit }, dt) => {
      if (!state.gameActive) {
        return
      }
      let dx = 0
      let dy = 0
      if (state.keys.ArrowUp) {
        dy -= 1
      }
      if (state.keys.ArrowDown) {
        dy += 1
      }
      if (state.keys.ArrowLeft) {
        dx -= 1
      }
      if (state.keys.ArrowRight) {
        dx += 1
      }
      if (dx === 0 && dy === 0) {
        return
      }
      if (dx !== 0 && dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy)
        dx /= len
        dy /= len
      }
      const newX = state.player.x + dx * state.player.speed * dt
      const newY = state.player.y + dy * state.player.speed * dt
      commit(MUTATIONS.SET_PLAYER_POSITION, { x: newX, y: newY })
      const cx = newX - state.world.width / 2
      const cy = newY - state.world.height / 2
      commit(MUTATIONS.SET_CAMERA, { x: cx, y: cy })
    },
    updateShooting: ({ state, commit }) => {
      if (!state.gameActive) {
        return
      }
      if (!state.fire.enabled) {
        return
      }
      if (state.fire.cooldown > 0) {
        return
      }
      const px = state.player.x
      const py = state.player.y
      const mx = state.mouse.x + state.camera.x
      const my = state.mouse.y + state.camera.y
      const dx = mx - px
      const dy = my - py
      const len = Math.hypot(dx, dy)
      if (len < 1) {
        return
      }
      const nx = dx / len
      const ny = dy / len
      const id = state.nextBulletId
      commit(MUTATIONS.SET_NEXT_BULLET_ID, id + 1)
      const speed = state.fire.bulletSpeed
      commit(MUTATIONS.SPAWN_BULLET, {
        id,
        x: px,
        y: py,
        vx: nx * speed,
        vy: ny * speed,
        radius: state.fire.bulletRadius,
        damage: state.fire.damage,
        penetration: state.fire.penetration,
      })
      commit(MUTATIONS.SET_FIRE_COOLDOWN, 1 / state.fire.rate)
    },
    updateEnemyShooting: ({ state, commit }, dt) => {
      if (!state.gameActive) {
        return
      }
      const px = state.player.x
      const py = state.player.y
      for (const enemy of state.enemies) {
        if (!enemy.fireRate || !enemy.shootDistance || !enemy.bulletSpeed) {
          continue
        }
        enemy.fireCooldown = Math.max(0, (enemy.fireCooldown ?? 0) - dt)
        const dx = px - enemy.x
        const dy = py - enemy.y
        const len = Math.hypot(dx, dy)
        if (len < 1) {
          continue
        }
        const shootDistance = enemy.shootDistance ?? enemy.maxDistance ?? 420
        if (len > shootDistance) {
          continue
        }
        if (enemy.fireCooldown > 0) {
          continue
        }
        const nx = dx / len
        const ny = dy / len
        const id = state.nextEnemyBulletId
        commit(MUTATIONS.SET_NEXT_ENEMY_BULLET_ID, id + 1)
        commit(MUTATIONS.SPAWN_ENEMY_BULLET, {
          id,
          x: enemy.x,
          y: enemy.y,
          vx: nx * (enemy.bulletSpeed ?? state.enemyFire.bulletSpeed),
          vy: ny * (enemy.bulletSpeed ?? state.enemyFire.bulletSpeed),
          radius: enemy.bulletRadius ?? state.enemyFire.bulletRadius,
          damage: enemy.bulletDamage ?? state.enemyFire.bulletDamage,
        })
        enemy.fireCooldown = 1 / (enemy.fireRate ?? 1)
      }
    },
    updateBullets: ({ commit }, dt) => {
      commit(MUTATIONS.MOVE_BULLETS, dt)
      commit(MUTATIONS.REMOVE_OUTSIDE_BULLETS)
    },
    updateEnemyBullets: ({ commit }, dt) => {
      commit(MUTATIONS.MOVE_ENEMY_BULLETS, dt)
      commit(MUTATIONS.REMOVE_OUTSIDE_ENEMY_BULLETS)
    },
    updateSpawning: ({ state, commit }) => {
      if (!state.gameActive) {
        return
      }
      if (!state.spawner.enabled) {
        return
      }
      if (state.spawner.cooldown > 0) {
        return
      }
      const { x, y } = spawnAtViewportEdge(state)
      const type = pickEnemyType()
      const config = ENEMY_TYPES[type]
      const id = state.nextEnemyId
      commit(MUTATIONS.SET_NEXT_ENEMY_ID, id + 1)
      commit(MUTATIONS.SPAWN_ENEMY, {
        id,
        type,
        x,
        y,
        speed: config.speed,
        radius: config.radius,
        hp: config.hp,
        maxHp: config.hp,
        reward: config.reward,
        damage: config.damage,
        preferredDistance: config.preferredDistance ?? null,
        minDistance: config.minDistance ?? null,
        maxDistance: config.maxDistance ?? null,
        fireRate: config.fireRate ?? null,
        shootDistance: config.shootDistance ?? null,
        bulletSpeed: config.bulletSpeed ?? null,
        bulletRadius: config.bulletRadius ?? null,
        bulletDamage: config.bulletDamage ?? null,
        fireCooldown: null,
      })
      commit(MUTATIONS.SET_SPAWN_COOLDOWN, 1 / state.spawner.rate)
    },
    updateEnemies: ({ commit }, dt) => {
      commit(MUTATIONS.MOVE_ENEMIES, dt)
    },
    handleBulletEnemyCollisions: ({ state, commit }) => {
      if (state.bullets.length === 0 || state.enemies.length === 0) {
        return
      }
      const bulletsToRemove = []
      for (const b of state.bullets) {
        for (const e of state.enemies) {
          const r = b.radius + e.radius
          if (dist2(b.x, b.y, e.x, e.y) <= r * r) {
            if (!b.penetration) {
              bulletsToRemove.push(b.id)
              commit(MUTATIONS.DAMAGE_ENEMY, { id: e.id, damage: b.damage })
              break
            }
            else {
              commit(MUTATIONS.DAMAGE_ENEMY, { id: e.id, damage: b.damage })
            }
          }
        }
      }
      commit(MUTATIONS.REMOVE_BULLET_IDS, bulletsToRemove)
      commit(MUTATIONS.REMOVE_DEAD_ENEMIES)
    },
    handleEnemyBulletPlayerCollisions: ({ state, commit }) => {
      if (state.enemyBullets.length === 0 || !state.gameActive) {
        return
      }
      const bulletsToRemove = []
      const px = state.player.x
      const py = state.player.y
      const pr = state.player.radius
      let totalDamage = 0
      for (const b of state.enemyBullets) {
        const r = pr + b.radius
        if (dist2(px, py, b.x, b.y) <= r * r) {
          bulletsToRemove.push(b.id)
          totalDamage += b.damage
        }
      }
      if (bulletsToRemove.length > 0) {
        commit(MUTATIONS.REMOVE_ENEMY_BULLET_IDS, bulletsToRemove)
      }
      if (totalDamage > 0) {
        commit(MUTATIONS.UPDATE_PLAYER_HEALTH, state.player.health - totalDamage)
      }
    },
    handleEnemyContactDamage: ({ state, commit }, dt) => {
      if (!state.gameActive) {
        return
      }
      if (state.enemies.length === 0) {
        return
      }
      const px = state.player.x
      const py = state.player.y
      const pr = state.player.radius
      let damagePerSecond = 0
      for (const e of state.enemies) {
        const r = pr + e.radius
        if (dist2(px, py, e.x, e.y) <= r * r) {
          damagePerSecond += state.contact.dps * e.damage
        }
      }
      if (damagePerSecond === 0) {
        return
      }
      commit(MUTATIONS.UPDATE_PLAYER_HEALTH, state.player.health - damagePerSecond * dt)
    },
    gameLoop: ({ dispatch, commit, state }, timestamp) => {
      if (!state.gameActive) {
        return
      }
      if (state.gamePaused) {
        return
      }
      if (typeof timestamp !== 'number') {
        return
      }
      if (state.lastTimestamp === 0) {
        commit(MUTATIONS.SET_LAST_TIME, timestamp)
        return
      }
      const dt = Math.min((timestamp - state.lastTimestamp) / 1000, 0.05)
      commit(MUTATIONS.SET_LAST_TIME, timestamp)
      dispatch('updatePlayerPosition', dt)
        .then(() => {
          commit(MUTATIONS.DEC_FIRE_COOLDOWN, dt)
        })
        .then(() => {
          commit(MUTATIONS.DEC_SPAWN_COOLDOWN, dt)
        })
        .then(() => {
          dispatch('updateShooting')
        })
        .then(() => {
          dispatch('updateBullets', dt)
        })
        .then(() => {
          dispatch('updateSpawning', dt)
        })
        .then(() => {
          dispatch('updateEnemies', dt)
        })
        .then(() => {
          dispatch('updateEnemyBullets', dt)
        })
        .then(() => {
          dispatch('handleEnemyBulletPlayerCollisions')
        })
        .then(() => {
          dispatch('updateEnemyShooting', dt)
        })
        .then(() => {
          dispatch('handleEnemyContactDamage', dt)
        })
        .then(() => {
          dispatch('handleBulletEnemyCollisions')
        })
        .then(() => {
          dispatch('regenMana', dt)
        })
        .then(() => {
          commit(MUTATIONS.UPDATE_EFFECTS, dt)
        })
        .then(() => {
          commit(MUTATIONS.REMOVE_EFFECT_IDS)
        })
        .then(() => {
          commit(MUTATIONS.DEC_SPECIAL_COOLDOWNS, dt)
        })
        .then(() => {
          commit(MUTATIONS.UPDATE_GAME_TIME, dt)
        })
    },
    resetGame: ({ commit }) => {
      commit(MUTATIONS.RESET_GAME)
    },
    togglePause: ({ commit, state, dispatch }) => {
      if (state.gameOver) {
        return
      }
      commit(MUTATIONS.TOGGLE_PAUSE)
      if (state.gamePaused) {
        dispatch('clearKeys')
      }
    },
    clearKeys: ({ state }) => {
      for (const k in state.keys) {
        state.keys[k] = false
      }
    },
    buyHeal: ({ commit }) => {
      commit(MUTATIONS.BUY_HEAL)
    },
    buyMana: ({ commit }) => {
      commit(MUTATIONS.BUY_MANA)
    },
    upgradeDamage: ({ commit }) => {
      commit(MUTATIONS.UPGRADE_DAMAGE)
    },
    upgradeMaxHealth: ({ commit }) => {
      commit(MUTATIONS.UPGRADE_MAX_HEALTH)
    },
    upgradeMaxMana: ({ commit }) => {
      commit(MUTATIONS.UPGRADE_MAX_MANA)
    },
    regenMana: ({ state, commit }, dt) => {
      if (!state.gameActive || state.gamePaused) {
        return
      }
      const newMana = Math.min(state.player.maxMana, state.player.mana + state.player.manaRegen * dt)
      commit(MUTATIONS.UPDATE_PLAYER_MANA, newMana)
    },
    useSpecialAOE({ state, commit }) {
      if (!state.gameActive || state.gamePaused) {
        return
      }
      const config = SPECIAL_ATTACKS.aoe
      const attackState = state.specialAttacks.aoe
      if (!attackState.enabled) {
        return
      }
      if (state.player.mana < config.manaCost) {
        return
      }
      if (attackState.cooldown > 0) {
        return
      }
      commit(MUTATIONS.USE_SPECIAL_AOE)
      const px = state.player.x
      const py = state.player.y
      const id = state.nextEffectId
      state.nextEffectId++
      commit(MUTATIONS.SPAWN_EFFECT, {
        id,
        type: 'aoe',
        x: px,
        y: py,
        followPlayer: true,
        radius: config.radius,
        life: 0.09
      })
      for (const enemy of state.enemies) {
        const dx = enemy.x - px
        const dy = enemy.y - py
        const totalRadius = config.radius + enemy.radius
        if (dx * dx + dy * dy <= totalRadius * totalRadius) {
          commit(MUTATIONS.DAMAGE_ENEMY, { id: enemy.id, damage: config.damage })
        }
      }
      commit(MUTATIONS.REMOVE_DEAD_ENEMIES)
    },
    useSpecialHeavyBullet({ state, commit }) {
      if (!state.gameActive || state.gamePaused) {
        return
      }
      const config = SPECIAL_ATTACKS.heavyShotBullet
      const attackState = state.specialAttacks.heavyShotBullet
      if (!attackState.enabled) {
        return
      }
      if (state.player.mana < config.manaCost) {
        return
      }
      if (attackState.cooldown > 0) {
        return
      }
      const px = state.player.x
      const py = state.player.y
      const mx = state.mouse.x + state.camera.x
      const my = state.mouse.y + state.camera.y
      const dx = mx - px
      const dy = my - py
      const len = Math.hypot(dx, dy)
      if (len < 1) {
        return
      }
      const nx = dx / len
      const ny = dy / len
      const id = state.nextBulletId
      commit(MUTATIONS.SET_NEXT_BULLET_ID, id + 1)
      commit(MUTATIONS.SPAWN_BULLET, {
        id,
        x: px,
        y: py,
        vx: nx * config.bulletSpeed,
        vy: ny * config.bulletSpeed,
        radius: config.bulletRadius,
        damage: config.damage,
        penetration: config.penetration,
        color: '#ff0000',
      })
      commit(MUTATIONS.USE_SPECIAL_HEAVY_BULLET)
    },
  },
}