<template>
  <MainLayout v-if="player.username" :threeCol="true">
    <NavBar class="navbar" @openExportModal="openModal('export')" />
    <MainScreen />
    <div class="sticky-btn" v-if="!player.gameOver">
      <router-link class="btn" :to="type === 'disable' ? '' : '/scan'">
        <CustomButton type="dark" :slim="true"> INCUBATE </CustomButton>
      </router-link>
    </div>
    <div class="btn" v-if="player.gameOver">
      <CustomButton
        v-if="player.mintingAllow && !player.minted"
        @click="mint"
        type="dark"
        :slim="true"
      >
        CLAIM NFT AWARDS
      </CustomButton>
      <a
        v-if="player.errors.network"
        @click="addPolygonNetwork()"
        class="add-polygon"
      >
        Switch to Polygon Network
      </a>
    </div>
  </MainLayout>

  <ModalDialog :show="modal.visible.value" @close="closeModal">
    <ModalExport v-if="modals.export" />
    <ModalShareSocials v-if="modals.shareSocials" />
    <ModalGameOver v-if="modals.gameOver" />
    <ModalMint v-if="modals.mint" />
  </ModalDialog>
</template>

<script>
import { useStore } from '@/stores/player'
import {
  computed,
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
  reactive,
  watch,
} from 'vue'
import egg from '@/assets/egg.svg?raw'
import { useModal } from '@/composables/useModal'
import { useWeb3 } from '../composables/useWeb3'
import { EXPLORER_BASE_URL, OPENSEA_BASE_URL } from '../constants'
import { POLLER_MILLISECONDS } from '@/constants.js'
import { importSvg } from '@/composables/importSvg.js'
import { useRouter } from 'vue-router'
export default {
  setup() {
    const modal = useModal()
    const player = useStore()
    const router = useRouter()
    const web3WittyCreatures = useWeb3()
    const interactionIn = computed(() => player?.interactionIn)
    const interactionOut = computed(() => player?.interactionOut)
    const modals = reactive({
      shareConfig: false,
      mint: false,
      export: false,
      preview: false,
      gameOver: false,
    })
    let playerInfoPoller = null
    // Handle end of game
    onBeforeMount(async () => {
      const token = await player.getToken()
      if (!token) {
        await player.authorize({ key: router.currentRoute.value.params.id })
        openModal('export')
      } else {
        await player.getPlayerInfo()
        if (player.id && router.currentRoute.value.params.id) {
          await player.interact({ key: router.currentRoute.value.params.id })
        }
        if (player.gameOver) {
          await player.getMintInfo()
          await player.getPreviews()
          if (player.minted) {
            await web3WittyCreatures.getTokenIds()
            await player.getMintedAwardsImages()
          }
        }
      }
    })
    onMounted(() => {
      playerInfoPoller = setInterval(async () => {
        await player.getPlayerInfo()
      }, POLLER_MILLISECONDS)
    })
    onBeforeUnmount(() => {
      clearInterval(playerInfoPoller)
    })
    const type = computed(() =>
      // TODO: update player.incubating naming when contracts are available
      player.incubating || (player.data && parseInt(player.data.tokenId) < 0)
        ? 'disable'
        : 'primary'
    )
    const mintStatus = computed(() =>
      player.mintInfo.blockHash ? 'minted' : 'pending'
    )
    function openModal(name) {
      const needProvider = name === 'mint'
      if (!web3WittyCreatures.isProviderConnected.value && needProvider) {
        modals['gameOver'] = true
      } else {
        modals[name] = true
      }
      modal.showModal()
    }
    function closeModal() {
      modals.shareSocials = false
      modals.mint = false
      modals.export = false
      modals.preview = false
      modals.gameOver = false
      modal.hideModal()
    }
    function mint() {
      if (type.value !== 'disable') {
        openModal('mint')
      }
    }
    function checkSocialsOpenModal() {
      if (
        !player.shareConfig &&
        (interactionIn.value || interactionOut.value) &&
        !player.socialsSharedMessage
      ) {
        openModal('shareSocials')
        player.socialsSharedMessage = true
      } else {
        closeModal('shareSocials')
      }
    }
    watch(interactionIn, () => {
      checkSocialsOpenModal()
    })
    watch(interactionOut, () => {
      checkSocialsOpenModal()
    })
    return {
      etherscanBaseUrl: EXPLORER_BASE_URL,
      openseaBaseUrl: OPENSEA_BASE_URL,
      mint,
      player,
      type,
      closeModal,
      openModal,
      modal,
      modals,
      mintStatus,
      enableProvider: web3WittyCreatures.enableProvider,
      addPolygonNetwork: web3WittyCreatures.addPolygonNetwork,
      isProviderConnected: web3WittyCreatures.isProviderConnected,
      importSvg,
      egg,
    }
  },
}
</script>

<style lang="scss" scoped>
.main-content {
  display: grid;
  grid-gap: 16px;
}
.sticky-btn {
  position: sticky;
  bottom: 16px;
  text-align: center;
  display: grid;
  grid-template-rows: max-content max-content;
  grid-gap: 8px;
  justify-items: center;
  .btn {
    width: 100%;
  }
  .add-polygon {
    width: max-content;
    color: $white;
    cursor: pointer;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 4px;
    background-color: var(--secondary-color);
    display: flex;
    .metamask {
      margin-right: 4px;
      width: 16px;
    }
  }
}
</style>
