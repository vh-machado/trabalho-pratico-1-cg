<template>
  <div class="flex relative gap-8 h-screen justify-center items-center p-8 bg-gradient-to-br from-blue-800 to-rose-800">
    <div class="w-[410px] h-[410px] bg-white">
      <CanvasGrid
        :feature="feature"
        :cell-size="10"
        :grid-size="400"
        :translacao-x-value="translacaoXValue"
        :translacao-y-value="translacaoYValue"
        :escala-x-value="escalaXValue"
        :escala-y-value="escalaYValue"
        :angulo-rotacao-value="anguloRotacaoValue"
        @update-feature="updateFeature"
      />
    </div>

    <div class="flex flex-col relative gap-3">
      <div class="flex gap-2">
        <button
          class="w-full px-6 py-2 bg-violet-400 rounded-md"
          :class="{'bg-violet-500': feature === 'linha-inserir-origem' || feature === 'linha-inserir-destino'}"
          @click="ativaModoLinha"
        >
          Linha
        </button>

        <button
          class="w-full px-6 py-2 bg-violet-400 rounded-md"
          :class="{'bg-violet-500': feature.includes('circulo')}"
          @click="ativaModoCirculo"
        >
          Círculo
        </button>
      </div>

      <div class="flex gap-2">
        <button
          class="w-full px-6 py-2 bg-violet-400 rounded-md"
          :class="{'bg-violet-500': feature === 'curva-inserir-origem' || feature === 'curva-inserir-destino' || feature === 'curva-finalizar-ctrl'}"
          @click="() => feature === 'curva-inserir-ctrl' ? finalizaCurva() : ativaModoCurva()"
        >
          {{ feature.includes('ctrl') ? 'Fim Ctrl' : 'Curva' }}
        </button>

        <button
          class="w-full px-6 py-2 bg-violet-400 rounded-md"
          @click="() => feature === 'polilinha-inserir-ponto' ? finalizaPolilinha() : ativaModoPolilinha()"
        >
          {{ feature === 'polilinha-inserir-ponto' ? 'Fim Polilinha' : 'Polilinha' }}
        </button>
      </div>

      <div class="flex gap-2">
        <button
          class="w-full px-6 py-2 bg-violet-400 rounded-md"
          :class="{'bg-violet-500': feature === 'preencher-recursivo'}"
          @click="ativaModoPreencherRecursivo"
        >
          Preencher Recursivo
        </button>

        <button
          class="w-full px-6 py-2 bg-violet-400 rounded-md"
          :class="{'bg-violet-500': feature === 'preencher-varredura'}"
          @click="ativaModoPreencherVarredura"
        >
          Preencher Varredura
        </button>
      </div>

      <div class="flex gap-2">
        <button
          class="w-full px-6 py-2 bg-violet-400 rounded-md"
          :class="{'bg-violet-500': feature === 'recorte-linha-inserir-bl'}"
          @click="ativaModoRecorteLinha"
        >
          Recortar Linha
        </button>

        <button
          class="w-full px-6 py-2 bg-violet-400 rounded-md"
          :class="{'bg-violet-500': feature === 'recorte-poligono-inserir-bl'}"
          @click="ativaModoRecortePoligono"
        >
          Recortar Polígono
        </button>
      </div>

      <div class="flex gap-2">
        <div class="flex justify-center items-center">
          <h1 class="p-2 bg-gray-200 rounded-l-md">
            X
          </h1>
          <input
            type="number"
            :value="translacaoXValue"
            class="flex h-full w-16 p-2 bg-gray-200 rounded-r-md"
            @change="$event => translacaoXValue = Number($event.target.value)"
          >
        </div>
        <div class="flex justify-center items-center">
          <h1 class="p-2 bg-gray-200 rounded-l-md">
            Y
          </h1>
          <input
            type="number"
            :value="translacaoYValue"
            class="flex h-full w-16 p-2 bg-gray-200 rounded-r-md"
            @change="$event => translacaoYValue = Number($event.target.value)"
          >
        </div>

        <button
          class="w-full px-6 py-2 bg-violet-400 rounded-md"
          @click="ativaModoTranslacaoPoligono"
        >
          Deslocar Polígono
        </button>
      </div>

      <div class="flex gap-2">
        <div class="flex justify-center items-center">
          <h1 class="p-2 bg-gray-200 rounded-l-md">
            X
          </h1>
          <input
            type="number"
            :value="escalaXValue"
            class="flex h-full w-16 p-2 bg-gray-200 rounded-r-md"
            @change="$event => escalaXValue = Number($event.target.value)"
          >
        </div>
        <div class="flex justify-center items-center">
          <h1 class="p-2 bg-gray-200 rounded-l-md">
            Y
          </h1>
          <input
            type="number"
            :value="escalaYValue"
            class="flex h-full w-16 p-2 bg-gray-200 rounded-r-md"
            @change="$event => escalaYValue = Number($event.target.value)"
          >
        </div>

        <button
          class="w-full px-6 py-2 bg-violet-400 rounded-md"
          :class="{'bg-violet-500': feature === 'escala-poligono'}"
          @click="ativaModoEscalaPoligono"
        >
          Escalar Polígono
        </button>
      </div>

      <div class="flex gap-2">
        <div class="flex justify-center items-center">
          <h1 class="p-2 bg-gray-200 rounded-l-md">
            Ângulo
          </h1>
          <input
            type="number"
            :value="anguloRotacaoValue"
            class="flex h-full w-16 p-2 bg-gray-200 rounded-r-md"
            @change="$event => anguloRotacaoValue = Number($event.target.value)"
          >
        </div>

        <button
          class="w-full px-6 py-2 bg-violet-400 rounded-md"
          :class="{'bg-violet-500': feature === 'rotacao-poligono'}"
          @click="ativaModoRotacaoPoligono"
        >
          Rotação Polígono
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>

// import { VueDrawingGrid } from 'vue-drawing-grid'
import { ref } from 'vue'
import CanvasGrid from './components/CanvasGrid.vue'

// const screenH = window.innerHeight

const feature = ref('normal')
const translacaoXValue = ref(0)
const translacaoYValue = ref(0)
const escalaXValue = ref(0)
const escalaYValue = ref(0)
const anguloRotacaoValue = ref(0)

defineEmits(['update:translacaoXValue', 'update:translacaoYValue'])

const updateFeature = (newValue) => {
  feature.value = newValue
}

const ativaModoLinha = () => {
  if (feature.value !== 'normal') {
    feature.value = 'normal'
  } else {
    feature.value = 'linha-inserir-origem'
  }
}

const ativaModoCirculo = () => {
  if (feature.value !== 'normal') {
    feature.value = 'normal'
  } else {
    feature.value = 'circulo-inserir-c'
  }
}

const ativaModoCurva = () => {
  if (feature.value !== 'normal') {
    feature.value = 'normal'
  } else {
    feature.value = 'curva-inserir-origem'
  }
}

const finalizaCurva = () => {
  feature.value = 'curva-finalizar-ctrl'
}

const ativaModoPolilinha = () => {
  if (feature.value !== 'normal') {
    feature.value = 'normal'
  } else {
    feature.value = 'polilinha-inserir-ponto'
  }
}

const finalizaPolilinha = () => {
  feature.value = 'polilinha-finalizar'
}

const ativaModoPreencherRecursivo = () => {
  if (feature.value === 'preencher-recursivo') {
    feature.value = 'normal'
  } else {
    feature.value = 'preencher-recursivo'
  }
}

const ativaModoPreencherVarredura = () => {
  if (feature.value === 'preencher-varredura') {
    feature.value = 'normal'
  } else {
    feature.value = 'preencher-varredura'
  }
}

const ativaModoRecorteLinha = () => {
  if (feature.value === 'recorte-linha-inserir-bl') {
    feature.value = 'normal'
  } else {
    feature.value = 'recorte-linha-inserir-bl'
  }
}

const ativaModoRecortePoligono = () => {
  if (feature.value === 'recorte-poligono-inserir-bl') {
    feature.value = 'normal'
  } else {
    feature.value = 'recorte-poligono-inserir-bl'
  }
}

const ativaModoTranslacaoPoligono = () => {
  if (feature.value === 'translacao-poligono') {
    feature.value = 'normal'
  } else {
    feature.value = 'translacao-poligono'
  }
}

const ativaModoEscalaPoligono = () => {
  if (feature.value === 'escala-poligono') {
    feature.value = 'normal'
  } else {
    feature.value = 'escala-poligono'
  }
}

const ativaModoRotacaoPoligono = () => {
  if (feature.value === 'rotacao-poligono') {
    feature.value = 'normal'
  } else {
    feature.value = 'rotacao-poligono'
  }
}

</script>
