<template>
  <woot-button
    v-if="isVideoIntegrationEnabled"
    v-tooltip.top-end="'Start a new video call with the customer'"
    icon="video"
    :is-loading="isLoading"
    color-scheme="secondary"
    variant="smooth"
    size="small"
    :title="'Whatsapp Templates'"
    @click="onClick"
  />
</template>
<script>
import { mapGetters } from 'vuex';
import DyteAPI from '../../../api/integrations/dyte';

export default {
  props: {
    conversationId: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return { isLoading: false };
  },
  computed: {
    ...mapGetters({
      appIntegrations: 'integrations/getAppIntegrations',
    }),
    isVideoIntegrationEnabled() {
      return this.appIntegrations.find(integration => {
        return integration.id === 'dyte' && !!integration.hooks.length;
      });
    },
  },
  mounted() {
    if (!this.appIntegrations.length) {
      this.$store.dispatch('integrations/get');
    }
  },
  methods: {
    async onClick() {
      this.isLoading = true;

      try {
        await DyteAPI.createAMeeting(this.conversationId);
      } catch (error) {
        // Ignore Error
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
