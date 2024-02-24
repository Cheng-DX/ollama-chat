<script setup lang="ts">
import { useChat } from './composables/useChat';

const { content, images, messages, submit } = useChat()
</script>

<template>
  <div>
    <textarea v-model="content" />
    <button @click="submit">Submit</button>
    <div v-for="message in messages">
      <p>{{ message.content }}</p>
    </div>
  </div>
</template>
