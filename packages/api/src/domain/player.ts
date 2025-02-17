import {
  DbPlayerVTO,
  ExtendedPlayerVTO,
  PlayerLeaderboardInfo,
  Social,
  ContactIndex,
} from '../types'
import { Interaction } from './interaction'

export class Player {
  creationIndex: number
  token?: string | undefined
  lastInteractionIn?: number | undefined
  lastInteractionOut?: number | undefined
  key: string
  color: number
  username: string
  score: number
  shareConfig: boolean
  nft: Array<string> = []
  socials: Social | null
  contacts: Array<ContactIndex> = []
  mintConfig: string

  constructor(vto: DbPlayerVTO) {
    this.key = vto.key
    this.username = vto.username
    this.score = vto.score
    this.nft = vto.nft
    this.token = vto.token
    this.creationIndex = vto.creationIndex
    this.color = vto.color
    this.shareConfig = vto.shareConfig
    this.socials = vto.socials
    this.contacts = vto.contacts
    this.mintConfig = vto.mintConfig
  }

  toExtendedPlayerVTO({
    lastInteractionOut,
    lastInteractionIn,
  }: {
    lastInteractionIn?: Interaction | null
    lastInteractionOut: Interaction | null
  }): ExtendedPlayerVTO {
    // Get all Player attributes except token
    const { ...protectedplayerVTO } = this.toDbVTO()
    return {
      player: {
        ...protectedplayerVTO,
      },
      lastInteractionIn: lastInteractionIn?.isActive()
        ? lastInteractionIn.toVTO()
        : null,
      lastInteractionOut: lastInteractionOut?.isActive()
        ? lastInteractionOut.toVTO()
        : null,
    }
  }

  toDbVTO(shoWToken = false): DbPlayerVTO {
    const vto = {
      lastInteractionIn: this.lastInteractionIn,
      lastInteractionOut: this.lastInteractionOut,
      key: this.key,
      username: this.username,
      score: this.score,
      nft: this.nft,
      token: this.token,
      creationIndex: this.creationIndex,
      color: this.color,
      shareConfig: this.shareConfig,
      contacts: this.contacts,
      socials: this.socials,
      mintConfig: this.mintConfig,
    }

    return shoWToken ? { ...vto, token: this.token } : vto
  }

  static getLeaderboard(
    players: Array<Player>,
    totalPlayers: number,
    paginationOffset = 0
  ): { players: Array<PlayerLeaderboardInfo>; total: number } {
    return {
      players: players
        .sort(
          (a, b) =>
            // sort by creation index if the players are tied
            b.score - a.score || a.username.localeCompare(b.username)
        )
        .map((p, index) => ({
          username: p.username,
          network: p.mintConfig,
          creationIndex: p.creationIndex,
          score: p.score,
          color: p.color,
          position: paginationOffset + index,
        })),
      total: totalPlayers,
    }
  }
}
