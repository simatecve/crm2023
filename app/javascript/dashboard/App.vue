<template>
  <div class="medium-12 column login">
    <div class="row align-center">
      <label>
        Email
        <input v-model="credentialEmail" type="text" />
      </label>
      <div>
        {{ v$ }}
      </div>
      <div>Value --> {{ credentialEmail }}</div>
    </div>
  </div>
</template>

<script>
import useVuelidate from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';
export default {
  data() {
    return {
      credentialEmail: '',
    };
  },
  validations() {
    return {
      credentialEmail: { required, email },
    };
  },
  setup() {
    return { v$: useVuelidate() };
  },
};
</script>
