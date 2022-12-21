<template>
  <div>
    <button
      class="button icon-button join-call-button"
      color-scheme="secondary"
      :is-loading="isLoading"
      @click="joinTheCall"
    >
      <fluent-icon icon="video-add" class="mr-2" />
      {{ $t('INTEGRATIONS.DYTE.CLICK_HERE_TO_JOIN') }}
    </button>
    <div v-if="dyteAuthToken" class="video-call--container" draggable>
      <iframe
        :src="
          `https://app.dyte.in/meeting/stage/${meetingData.room_name}?authToken=${dyteAuthToken}&showSetupScreen=true&disableVideoBackground=true`
        "
        allow="camera;microphone;fullscreen;display-capture;picture-in-picture;clipboard-write;"
      />
      <button
        class="button small join-call-button leave-room-button"
        :is-loading="isLoading"
        @click="leaveTheRoom"
      >
        {{ $t('INTEGRATIONS.DYTE.LEAVE_THE_ROOM') }}
      </button>
    </div>
  </div>
</template>
<script>
import APIClient from 'widget/api/message';
import FluentIcon from 'shared/components/FluentIcon/Index.vue';

export default {
  components: {
    FluentIcon,
  },
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
  methods: {
    async joinTheCall() {
      const {
        data: { success, data },
      } = await APIClient.addParticipantToMeeting(this.messageId);
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
<style lang="scss" scoped>
@import '~widget/assets/scss/variables.scss';

.video-call--container {
  position: fixed;
  top: 72px;
  left: 0;
  width: 100%;
  height: 100%;

  z-index: 100;

  iframe {
    width: 100%;
    height: calc(100% - 72px);

    border: 0;
  }
}

.join-call-button {
  margin: $space-small 0;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.leave-room-button {
  position: absolute;
  top: 0;
  right: $space-small;
}
</style>
