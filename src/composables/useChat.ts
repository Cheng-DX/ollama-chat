import { Ollama, type Message } from 'ollama'
import { ref } from 'vue'

const ollama = new Ollama({ host: 'http://localhost:11434' })

async function resolveImages(images: (Uint8Array | URL | string | File)[]) {
  return Promise.all(images.map(async (image) => {
    if (image instanceof Uint8Array) {
      return image;
    } else if (typeof image === 'string' || image instanceof URL) {
      const response = await fetch(image.toString());
      const buffer = await response.arrayBuffer();
      return new Uint8Array(buffer);
    } else if (image instanceof File) {
      return new Promise<Uint8Array>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
        reader.onerror = reject;
        reader.readAsArrayBuffer(image);
      });
    } else {
      throw new Error('Unsupported image type');
    }
  }));
}

export function useChat() {
  const content = ref('')
  const images = ref<(Uint8Array | URL | string | File)[]>([])
  const messages = ref<Message[]>([])

  async function submit() {
    messages.value.push({
      content: content.value,
      role: 'user',
      images: await resolveImages(images.value)
    })
    content.value = ''
    images.value = []
    const asyncGenerator = await ollama.chat({
      model: 'gemma:2b',
      messages: messages.value,
      stream: true
    })
    messages.value.push({
      content: '',
      role: 'assistant',
      images: [] as Uint8Array[] | string[]
    })
    // AsyncGenerator
    for await (const response of asyncGenerator) {
      const { message, done } = response
      if (message && !done) {
        messages.value[messages.value.length - 1].content += message.content
        // if (message.images) {
        //   const imgs = message.images
        //   messages.value[0].images?.push(imgs)
        // }
      }
    }
  }

  return {
    content,
    images,
    messages,
    submit,
  }
}
