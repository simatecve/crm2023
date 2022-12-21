<template>
  <div>
    <woot-button
      size="small"
      variant="smooth"
      color-scheme="secondary"
      icon="video-add"
      class="join-call-button"
      :is-loading="isLoading"
      @click="joinTheCall"
    >
      {{ $t('INTEGRATION_SETTINGS.DYTE.CLICK_HERE_TO_JOIN') }}
    </woot-button>
    <div v-if="dyteAuthToken" class="video-call--container" draggable>
      <iframe
        :src="
          `https://app.dyte.in/meeting/stage/${meetingData.room_name}?authToken=${dyteAuthToken}&showSetupScreen=true&disableVideoBackground=true`
        "
        allow="camera;microphone;fullscreen;display-capture;picture-in-picture;clipboard-write;"
      />
      <woot-button
        size="small"
        variant="smooth"
        color-scheme="secondary"
        class="join-call-button"
        :is-loading="isLoading"
        @click="leaveTheRoom"
      >
        {{ $t('INTEGRATION_SETTINGS.DYTE.LEAVE_THE_ROOM') }}
      </woot-button>
    </div>
  </div>
</template>
<script>
import DyteAPI from '../../../../api/integrations/dyte';
export default {
  props: {
    messageId: {
      type: Number,
      required: true,
    },
    meetingData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return { isLoading: false, dyteAuthToken: '', isSDKMounted: false };
  },
  mounted() {
    window.addEventListener('message', this.receiveMessage, false);
  },
  beforeDestroy() {
    window.removeEventListener('message', this.receiveMessage, false);
  },
  methods: {
    async joinTheCall() {
      const {
        data: { success, data },
      } = await DyteAPI.addParticipantToMeeting(this.messageId);
      if (success) {
        this.dyteAuthToken = data.authResponse.authToken;
      }
    },
    leaveTheRoom() {
      this.dyteAuthToken = '';
    },
  },
};
</script>
<style lang="scss">
.join-call-button {
  margin: var(--space-small) 0;
}

.video-call--container {
  position: fixed;
  bottom: var(--space-normal);
  right: 0;
  z-index: 10000;
  padding: var(--space-smaller);
  background: var(--b-800);
  border-radius: var(--border-radius-normal);

  iframe {
    width: 600px;
    height: 600px;
    border: 0;
  }
  button {
    position: absolute;
    top: var(--space-normal);
    right: var(--space-normal);
  }
}
</style>
