<template>
  <div
    v-if="!forwardTo"
    class="wizard-body small-12 medium-9 columns height-auto"
  >
    <div class="row channels">
      <div
        v-if="globalConfig.azureAppId"
        class="small-6 medium-4 large-3 columns channel"
        @click="onMicrosoftClick"
      >
        <img src="~dashboard/assets/images/channels/microsoft.png" />
        <h3 class="channel__title">
          Microsoft
        </h3>
      </div>
      <div
        class="small-6 medium-4 large-3 columns channel"
        @click="onOtherClick"
      >
        <img src="~dashboard/assets/images/channels/email.png" />
        <h3 class="channel__title">
          Other
        </h3>
      </div>
    </div>
  </div>
  <forward-to-option v-else />
</template>
<script>
import * as msal from '@azure/msal-browser';
import ForwardToOption from './Email/ForwardToOption.vue';
import { mapGetters } from 'vuex';
import router from '../../../..';

export default {
  components: {
    ForwardToOption,
  },
  data() {
    return { forwardTo: false };
  },
  computed: {
    ...mapGetters({ globalConfig: 'globalConfig/get' }),
  },
  methods: {
    async onMicrosoftClick() {
      try {
        const msalConfig = {
<<<<<<< HEAD
          auth: {
            clientId: '67fa631b-e958-4ccb-95f0-ecede13d53ce',
          },
=======
          auth: { clientId: this.globalConfig.azureAppId },
>>>>>>> df7e28fb3 (Added channel creation flow)
        };

        const msalInstance = new msal.PublicClientApplication(msalConfig);

        const loginResponse = await msalInstance.loginPopup({
          scopes: [
            'https://outlook.office.com/IMAP.AccessAsUser.All',
            'https://outlook.office.com/SMTP.Send',
          ],
          redirectUri: window.location.origin,
        });

<<<<<<< HEAD
        console.log(loginResponse);
=======
        const { account: { username, name } = {} } = loginResponse;

        const emailChannel = await this.$store.dispatch(
          'inboxes/createChannel',
          {
            name,
            channel: {
              type: 'email',
              email: username,
              provider: 'microsoft',
              provider_config: loginResponse,
            },
          }
        );

        router.replace({
          name: 'settings_inboxes_add_agents',
          params: {
            page: 'new',
            inbox_id: emailChannel.id,
          },
        });
>>>>>>> df7e28fb3 (Added channel creation flow)
      } catch (err) {
        // handle error
      }
    },
    onOtherClick() {
      this.forwardTo = true;
    },
  },
};
</script>
