<template>
  <video-call
    v-if="contentAttributes.type === 'dyte'"
    :message-id="messageId"
  />
</template>
<script>
import VideoCall from './VideoCall.vue';
export default {
  components: { VideoCall },
  props: {
    messageId: {
      type: Number,
      required: true,
    },
    contentAttributes: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>
