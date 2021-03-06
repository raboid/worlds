import Entity from "./entities"
import Tile from "./tiles"

import { calculateMoveVector } from "./util"

export default class Game {
  static SPEED = 0.005
  static EPSILON = 1

  constructor() {
    this.entities = []
    this.tiles = {}
  }

  update = delta => {
    for (let i = 0, length = this.entities.length; i < length; i++) {
      const entity = this.entities[i]

      if (entity.tX !== undefined && entity.tY !== undefined) {
        if (entity.vX === undefined && entity.vY === undefined) {
          const { vX, vY } = calculateMoveVector(entity, {
            x: entity.tX,
            y: entity.tY
          })

          entity.vX = vX
          entity.vY = vY
        }

        if (entity.vX) {
          entity.x += entity.vX * delta * Game.SPEED

          const pixelX = Math.round(entity.x * 24)
          const pixelDestX = Math.round(entity.tX * 24)

          entity.sprite.x = pixelX

          if (
            entity.sprite.x <= pixelDestX + Game.EPSILON &&
            entity.sprite.x >= pixelDestX - Game.EPSILON
          ) {
            entity.x = entity.tX
            entity.sprite.x = pixelDestX
            entity.vX = 0
          }
        }

        if (entity.vY) {
          entity.y += entity.vY * delta * Game.SPEED

          const pixelY = Math.round(entity.y * 24)
          const pixelDestY = Math.round(entity.tY * 24)

          entity.sprite.y = pixelY

          if (
            entity.sprite.y <= pixelDestY + Game.EPSILON &&
            entity.sprite.y >= pixelDestY - Game.EPSILON
          ) {
            entity.y = entity.tY
            entity.sprite.y = pixelDestY
            entity.vY = 0
          }
        }
      }

      if (entity.vX === 0 && entity.vY === 0) {
        delete entity.vX
        delete entity.vY

        if (entity === this.player) {
          const updates = { x: entity.x, y: entity.y }
          window.Server.updateUser(updates)
          window.Server.updateEntity(window.userId, updates)
        }
      }
    }
  }

  unload = () => {}

  updateEntity = (id, updates) => {
    const entity = this.entities.find(e => (e.id = id))

    if (!entity) {
      return
    }

    if (
      updates.tX !== undefined &&
      updates.tY !== undefined &&
      (updates.tX !== entity.tX || updates.tY !== entity.tY)
    ) {
      delete entity.vX
      delete entity.vY

      entity.tX = updates.tX
      entity.tY = updates.tY
    }
  }

  addEntity = data => {
    console.log("adding entity", data)
    const entity = Entity(data)

    if (!entity) {
      return
    }

    if (entity.sprite) {
      window.Renderer.addEntity(entity.sprite)
    }

    this.entities.push(entity)
  }

  removeEntity = id => {
    const index = this.entities.findIndex(e => e.id === id)

    if (index) {
      if (this.entities[index].sprite) {
        window.Renderer.removeEntity(this.entities[index].sprite)
      }

      delete this.entities[index]
    }
  }

  addTile = (id, data) => {
    const tile = Tile(data)

    if (!tile) {
      return
    }

    if (this.tiles[id]) {
      this.removeTile(id)
    }

    if (tile.sprite) {
      window.Renderer.addTile(tile.sprite)
    }

    this.tiles[id] = tile
  }

  removeTile = id => {
    if (this.tiles[id].sprite) {
      window.Renderer.removeEntity(this.tiles[id].sprite)
    }

    delete this.tiles[id]
  }
}
