<script lang="ts" setup>
const props = defineProps<{
  href: string
}>()

const isLoading = ref(false)
const isOpened = ref(false)
const activeButton = ref<'video' | 'screenshot' | null>(null)

async function handleCopy(type: 'video' | 'screenshot') {
  activeButton.value = type
  isLoading.value = true
  isOpened.value = false

  try {
    const response: any = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: 'newRequests',
          href: props.href,
          module: type,
        },
        response => {
          if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError)
          }
          resolve(response)
        },
      )
    })

    if (response.status === 'success' && response.data) {
      // Открываем полученный URL в новой вкладке
      window.open(response.data, '_blank')
      isOpened.value = true

      setTimeout(() => {
        isOpened.value = false
      }, 3000)
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    isLoading.value = false
    activeButton.value = null
  }
}
</script>

<template>
  <div class="relative flex gap-2">
    <button
      @click="handleCopy('video')"
      class="relative inline-flex items-center justify-center px-4 h-10 overflow-hidden font-medium transition-all rounded-lg group"
      :class="{
        'bg-gray-100': isLoading && activeButton === 'video',
        'bg-blue-500 hover:bg-blue-600': !isLoading || activeButton !== 'video',
        '!bg-green-500': isOpened && activeButton === 'video',
      }"
      :disabled="isLoading && activeButton === 'video'">
      <span
        class="relative text-white transition-all duration-200 ease-in-out"
        :class="{ 'opacity-0': (isLoading && activeButton === 'video') || (isOpened && activeButton === 'video') }">
        Copy Video
      </span>

      <span
        v-if="isOpened && activeButton === 'video'"
        class="absolute inset-0 flex items-center justify-center text-white">
        Copied!
      </span>

      <span
        v-if="isLoading && activeButton === 'video' && !isOpened"
        class="absolute inset-0 flex items-center justify-center">
        <svg
          class="w-5 h-5 text-blue-600 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </span>
    </button>

    <button
      @click="handleCopy('screenshot')"
      class="relative inline-flex items-center justify-center px-4 h-10 overflow-hidden font-medium transition-all rounded-lg group"
      :class="{
        'bg-gray-100': isLoading && activeButton === 'screenshot',
        'bg-blue-500 hover:bg-blue-600': !isLoading || activeButton !== 'screenshot',
        '!bg-green-500': isOpened && activeButton === 'screenshot',
      }"
      :disabled="isLoading && activeButton === 'screenshot'">
      <span
        class="relative text-white transition-all duration-200 ease-in-out"
        :class="{
          'opacity-0': (isLoading && activeButton === 'screenshot') || (isOpened && activeButton === 'screenshot'),
        }">
        Copy Screenshot
      </span>

      <span
        v-if="isOpened && activeButton === 'screenshot'"
        class="absolute inset-0 flex items-center justify-center text-white">
        Copied!
      </span>

      <span
        v-if="isLoading && activeButton === 'screenshot' && !isOpened"
        class="absolute inset-0 flex items-center justify-center">
        <svg
          class="w-5 h-5 text-blue-600 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </span>
    </button>

    <transition name="fade">
      <div
        v-if="isOpened"
        class="absolute z-10 p-2 mt-2 text-sm text-white bg-green-500 rounded-md shadow-lg -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
        Link opened in new tab!
      </div>
    </transition>
  </div>
</template>

<style scoped>
button {
  position: relative;
  overflow: hidden;
  min-width: 120px;
  transition: background-color 0.3s ease;
}

button:disabled {
  cursor: not-allowed;
}

button:not(:disabled) {
  cursor: pointer;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.bg-gray-100 {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
