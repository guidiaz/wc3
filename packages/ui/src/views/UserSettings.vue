<template>
  <MainLayout>
    <div class="container">
      <SectionHeader title="SETTINGS" :from-auth="fromAuth" />
      <form class="form">
        <h3 class="form-title">Network settings</h3>
        <label class="form-label">Network</label>
        <CustomSelect
          class="field margin"
          :options="formatedNetworks"
          :value="{ key: player.mintConfig }"
          label="network"
          @change="setValue"
        />
        <h3 class="form-title">Social settings</h3>
        <label class="form-label">Name</label>
        <CustomInput
          class="field"
          data-lpignore="false"
          type="text"
          label="name"
          :value="player.socials?.name"
          @change="setValue"
        />
        <label class="form-label">Company name</label>
        <CustomInput
          class="field"
          data-lpignore="false"
          type="text"
          label="company"
          :value="player.socials?.company"
          @change="setValue"
        />
        <label class="form-label">Twitter</label>
        <CustomInput
          class="field"
          data-lpignore="false"
          type="text"
          label="twitter"
          :value="player.socials?.twitter"
          @change="setValue"
        />
        <label class="form-label">Discord</label>
        <CustomInput
          class="field"
          data-lpignore="false"
          type="text"
          label="discord"
          :value="player.socials?.discord"
          @change="setValue"
        />
        <label class="form-label">Telegram</label>
        <CustomInput
          class="field"
          data-lpignore="false"
          type="text"
          label="telegram"
          :value="player.socials?.telegram"
          @change="setValue"
        />
        <label class="form-label">Share socials by default</label>
        <CustomSwitch
          class="field margin"
          :value="player.shareConfig"
          label="share"
          @change="setValue"
        />
      </form>
      <router-link v-if="fromAuth" to="/">
        <CustomButton type="dark" :slim="true"> CONTINUE </CustomButton>
      </router-link>
    </div>
  </MainLayout>
</template>
<script>
import { useStore } from '@/stores/player'
import { onBeforeMount, computed, ref } from 'vue'
import { NETWORKS } from '@/constants'
import { useRouter } from 'vue-router'
export default {
  setup() {
    const player = useStore()
    const router = useRouter()
    const fromAuth = ref(!!router.currentRoute.value.params?.id)
    onBeforeMount(async () => {
      await player.getPlayerInfo()
      await player.getSocials()
    })
    const formatedNetworks = computed(() => {
      return Object.values(NETWORKS)
    })
    const setValue = async ({ label, value }) => {
      // TODO: refactor
      if (label) {
        const setMintConfig = label === 'network'
        const setShareConfig = label === 'share'
        const socials =
          setMintConfig || setShareConfig
            ? {
                ...player.socials,
              }
            : {
                ...player.socials,
                [label]: value,
              }
        const mintConfig = setMintConfig ? value : player.mintConfig
        const shareConfig = setShareConfig ? value : player.shareConfig
        await player.saveConfig({
          socials,
          shareConfig,
          mintConfig,
        })
      }
    }

    return {
      player,
      setValue,
      formatedNetworks,
      fromAuth,
    }
  },
}
</script>
<style lang="scss" scoped>
.form {
  display: grid;
  grid-gap: 16px;
  grid-template-rows: repeat(7, max-content);
  text-align: left;
  .form-title {
    font-weight: bolder;
    font-size: 16px;
    font-family: JoystixMonospace, mono;
  }
  .field {
    margin-bottom: 16px;
  }
  .margin {
    margin-bottom: 16px;
  }
  .form-label {
    font-size: 16px;
    text-align: left;
    font-weight: bold;
  }
  .social-label {
    font-size: 16px;
    font-weight: bold;
    color: var(--primary-color);
  }
}
</style>
