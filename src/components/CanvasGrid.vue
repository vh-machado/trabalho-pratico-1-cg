<template>
  <div :class="`relative w-[${totalGridSize}px] h-[${totalGridSize}px] z-0`">
    <canvas
      id="canvasBg"
      class="absolute top-0 left-0 z-1"
      :width="totalGridSize"
      :height="totalGridSize"
    />
    <canvas
      id="canvas"
      class="absolute top-0 left-0 z-2"
      :width="totalGridSize"
      :height="totalGridSize"
      @click="onClick($event)"
    />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import bresenham from '../algoritmos/bresenham'
import curva from '../algoritmos/curva'
import pontoMedio from '../algoritmos/pontoMedio'
import recorte from '../algoritmos/recorte'
import translacao from '../algoritmos/translacao'
import escala from '../algoritmos/escala'
import rotacao from '../algoritmos/rotacao'
import varredura from '../algoritmos/varredura'

export default defineComponent({
  name: 'CanvasGrid',
  props: {
    modelValue: {
      type: Object,
      default: () => { return {} }
    },
    mode: {
      type: String,
      default: 'Draw'
    },
    gridSize: {
      type: Number,
      default: 1000
    },
    gridColor: {
      type: String,
      default: '#d9d9d9'
    },
    cellSize: {
      type: Number,
      default: 20
    },
    colors: {
      type: Object,
      default: () => {
        return {
          draw: '#06b6d4',
          selection: '#fef08a',
          ctrlPoint: '#d9f99d',
          fill: '#bae6fd'
        }
      }
    },
    feature: {
      type: String,
      default: 'normal'
    },
    translacaoXValue: {
      type: Number,
      default: 0
    },
    translacaoYValue: {
      type: Number,
      default: 0
    },
    escalaXValue: {
      type: Number,
      default: 0
    },
    escalaYValue: {
      type: Number,
      default: 0
    },
    anguloRotacaoValue: {
      type: Number,
      default: 0
    }

  },
  emits: ['update', 'update:modelValue', 'updateFeature'],
  data () {
    return {
      canvas: null,
      canvasBg: null,
      ctx: null,
      ctxBg: null,
      isBusy: false,
      elements: [],
      distance: 0,
      selectedCell: { x: 0, y: 0 },
      curveCells: [],
      operationCells: [],
      clipWindow: { xMax: 0, yMax: 0, xMin: 0, yMin: 0 }
    }
  },
  computed: {
    quadrantGridSize: {
      get () {
        return this.gridSize / 2
      }
    },
    totalGridSize: {
      get () {
        return this.gridSize + this.cellSize
      }
    },
    cells: {
      get () {
        return this.modelValue
      },
      set (newValue) {
        console.log('cells', newValue)
        this.$emit('update:modelValue', newValue)
      }
    },
    raio: {
      get () {
        return this.distance
      },
      set (newValue) {
        console.log('raio', newValue)
        this.distance = newValue
      }
    },
    hasError: function () {
      return this.errors.length > 0
    }
  },

  watch: {
    data: {
      deep: true,
      handler (newValue) {
        this.cells = newValue
        this.fillGrid(this.cells)
      }
    },
    feature: {
      handler (newValue) {
        if (newValue === 'polilinha-finalizar') {
          if (this.operationCells.length > 0) {
            this.operationCells.forEach((cell) => {
              this.clearCell(cell)
            })
            this.desenhaPolilinha(this.operationCells)
            this.$emit('updateFeature', 'polilinha-inserir-ponto')
            this.operationCells = []
          } else {
            this.$emit('updateFeature', 'normal')
          }
        } else if (newValue === 'preencher-varredura') {
          this.preencheVarredura()
        } else if (newValue === 'translacao-poligono') {
          const poligonosDesenhados = this.elements.filter(e => e.tipo === 'poligono')
          poligonosDesenhados.forEach(poligono => {
            this.deslocaPoligono({ x: this.translacaoXValue, y: this.translacaoYValue }, poligono)
          })
          this.$emit('updateFeature', 'normal')
        } else if (newValue === 'translacao-poligono') {
          const poligonosDesenhados = this.elements.filter(e => e.tipo === 'poligono')
          poligonosDesenhados.forEach(poligono => {
            this.deslocaPoligono({ x: this.translacaoXValue, y: this.translacaoYValue }, poligono)
          })
          this.$emit('updateFeature', 'normal')
        }
      }
    }
  },
  mounted () {
    this.generateCanvas()
    this.generateGrid(this.totalGridSize, this.totalGridSize, this.cellSize)
    this.calculateGridSizes(this.quadrantGridSize, this.cellSize)

    if (this.modelValue != null) this.mergeData(this.modelValue)
    this.fillGrid(this.cells)

    this.preencheVarredura()
  },
  methods: {
    generateCanvas () {
      this.canvas = document.getElementById('canvas')
      this.ctx = this.canvas.getContext('2d')
      this.canvasBg = document.getElementById('canvasBg')
      this.ctxBg = this.canvasBg.getContext('2d')
    },
    generateGrid (width, height, cellSize) {
      // canvasBg
      this.ctxBg.beginPath()
      for (let x = 0; x <= width; x += cellSize) {
        this.ctxBg.moveTo(x, 0)
        this.ctxBg.lineTo(x, height)
      }
      this.ctxBg.strokeStyle = this.gridColor
      this.ctxBg.lineWidth = 1
      this.ctxBg.stroke()
      this.ctxBg.beginPath()
      for (let y = 0; y <= height; y += cellSize) {
        this.ctxBg.moveTo(0, y)
        this.ctxBg.lineTo(width, y)
      }
      this.ctxBg.lineWidth = 1
      this.ctxBg.stroke()

      this.ctxBg.beginPath()

      this.ctxBg.moveTo(0, this.totalGridSize / 2)
      this.ctxBg.lineTo(this.totalGridSize, this.totalGridSize / 2)
      this.ctxBg.strokeStyle = '#909090'
      this.ctxBg.lineWidth = 1
      this.ctxBg.stroke()

      this.ctxBg.moveTo(this.totalGridSize / 2, 0)
      this.ctxBg.lineTo(this.totalGridSize / 2, this.totalGridSize)
      this.ctxBg.strokeStyle = '#909090'
      this.ctxBg.lineWidth = 1
      this.ctxBg.stroke()
    },
    calculateGridSizes (quadrantGridSize, cellSize) {
      let xNodes, yNodes
      if (!this.xNodes) {
        xNodes = Math.floor(quadrantGridSize / cellSize)
      }

      if (!this.yNodes) {
        yNodes = Math.floor(quadrantGridSize / cellSize)
      }

      for (let x = -Math.floor(quadrantGridSize / cellSize); x <= xNodes; x++) {
        for (let y = -Math.floor(quadrantGridSize / cellSize); y <= yNodes; y++) {
          this.cells[`${x},${y}`] = {
            x,
            y,
            size: cellSize,
            color: null
          }
        }
      }
    },
    getCellId (x, y) {
      return `${Math.floor(x / this.cellSize)},${Math.floor(
          y / this.cellSize
        )}`
    },
    getCell (x, y) {
      return this.cells[`${x},${y}`]
    },
    clearCell (cell) {
      this.ctx.clearRect(
        (this.quadrantGridSize + (cell.x * cell.size)),
        (this.quadrantGridSize - (cell.y * cell.size)),
        cell.size,
        cell.size
      )
    },
    fillCell (cell, color) {
      if (cell) {
        this.clearCell(cell)
        this.ctx.fillStyle = color

        this.ctx.fillRect(
          (this.quadrantGridSize + (cell.x * cell.size)),
          (this.quadrantGridSize - (cell.y * cell.size)),
          cell.size,
          cell.size
        )
      }

      this.updateData({ ...cell, color })
    },
    fillGrid (cells) {
      Object.values(cells).forEach((p) => {
        if (p.color == null) return
        this.fillCell(p, p.color)
      })
    },
    updateData (cell) {
      this.cells[`${cell.x},${cell.y}`] = cell

      this.$emit('update', this.cells)
      this.$emit('update:modelValue', this.cells)
    },
    mergeData (data) {
      if (data == null) return
      this.cells = { ...this.cells, ...data }
    },

    onClick (event) {
      console.log(this.feature)
      if (this.isBusy) return
      this.isBusy = true
      const rect = this.canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const clickedX = Math.floor(x / this.cellSize) - Math.floor(this.quadrantGridSize / this.cellSize)
      const clickedY = Math.floor(this.quadrantGridSize / this.cellSize) - Math.floor(y / this.cellSize)

      console.log('clickedX:', clickedX)
      console.log('clickedY:', clickedY)
      if (this.feature === 'circulo-inserir-c') {
        this.selectedCell = { x: clickedX, y: clickedY }
        this.$emit('updateFeature', 'circulo-inserir-r')
        const centerCell = this.getCell(clickedX, clickedY)
        this.fillCell(centerCell, this.colors.selection)
      } else if (this.feature === 'circulo-inserir-r') {
        const centerCell = this.getCell(this.selectedCell.x, this.selectedCell.y)
        this.clearCell(centerCell)
        this.raio = this.calculaDistancia(this.selectedCell, { x: clickedX, y: clickedY })
        this.desenhaCirculo(this.raio, this.selectedCell.x, this.selectedCell.y)
        this.$emit('updateFeature', 'circulo-inserir-c')
      } else if (this.feature === 'linha-inserir-origem') {
        const origemCell = this.getCell(clickedX, clickedY)
        this.selectedCell = { x: clickedX, y: clickedY }
        this.fillCell(origemCell, this.colors.selection)
        this.$emit('updateFeature', 'linha-inserir-destino')
      } else if (this.feature === 'linha-inserir-destino') {
        this.desenhaLinha(this.selectedCell.x, this.selectedCell.y, clickedX, clickedY)
        this.$emit('updateFeature', 'linha-inserir-origem')
      } else if (this.feature === 'curva-inserir-origem') {
        this.curveCells.push({ x: clickedX, y: clickedY })
        this.fillCell(this.getCell(this.curveCells[0].x, this.curveCells[0].y), this.colors.selection)
        this.$emit('updateFeature', 'curva-inserir-destino')
      } else if (this.feature === 'curva-inserir-destino') {
        this.curveCells.push({ x: clickedX, y: clickedY })
        this.fillCell(this.getCell(this.curveCells[1].x, this.curveCells[1].y), this.colors.selection)
        this.$emit('updateFeature', 'curva-inserir-ctrl')
      } else if (this.feature === 'curva-inserir-ctrl') {
        this.curveCells.splice(this.curveCells.length - 1, 0, { x: clickedX, y: clickedY })
        this.fillCell(this.getCell(this.curveCells[this.curveCells.length - 2].x, this.curveCells[this.curveCells.length - 2].y), this.colors.ctrlPoint)
      } else if (this.feature === 'curva-finalizar-ctrl') {
        this.curveCells.splice(this.curveCells.length - 1, 0, { x: clickedX, y: clickedY })
        this.fillCell(this.getCell(this.curveCells[this.curveCells.length - 2].x, this.curveCells[this.curveCells.length - 2].y), this.colors.ctrlPoint)
        this.curveCells.forEach((cell) => {
          this.clearCell(this.getCell(cell.x, cell.y))
        })
        this.desenhaCurva(this.curveCells)
        this.$emit('updateFeature', 'curva-inserir-origem')
        this.curveCells = []
      } else if (this.feature === 'polilinha-inserir-ponto') {
        const selectedCell = this.getCell(clickedX, clickedY)
        this.operationCells.push(selectedCell)
        this.fillCell(selectedCell, this.colors.selection)
      } else if (this.feature === 'preencher-recursivo') {
        const selectedCell = this.getCell(clickedX, clickedY)
        this.fillCell(selectedCell, this.colors.selection)
        this.preencheRecursivamente(clickedX, clickedY)
      } else if (this.feature === 'recorte-linha-inserir-bl') {
        this.clipWindow.xMin = clickedX
        this.clipWindow.yMin = clickedY
        this.fillCell(this.getCell(clickedX, clickedY), this.colors.selection)
        this.$emit('updateFeature', 'recorte-linha-inserir-tr')
      } else if (this.feature === 'recorte-linha-inserir-tr') {
        this.clipWindow.xMax = clickedX
        this.clipWindow.yMax = clickedY
        this.fillCell(this.getCell(clickedX, clickedY), this.colors.selection)
        this.clearCell(this.getCell(this.clipWindow.xMax, this.clipWindow.yMax))
        this.clearCell(this.getCell(this.clipWindow.xMin, this.clipWindow.yMin))

        const linhasDesenhadas = this.elements.filter(e => e.tipo === 'linha')
        linhasDesenhadas.forEach(linha => {
          this.recortaLinha(linha, this.clipWindow)
        })
        this.$emit('updateFeature', 'recorte-linha-inserir-bl')
      } else if (this.feature === 'recorte-poligono-inserir-bl') {
        this.clipWindow.xMin = clickedX
        this.clipWindow.yMin = clickedY
        this.fillCell(this.getCell(clickedX, clickedY), this.colors.selection)
        this.$emit('updateFeature', 'recorte-poligono-inserir-tr')
      } else if (this.feature === 'recorte-poligono-inserir-tr') {
        this.clipWindow.xMax = clickedX
        this.clipWindow.yMax = clickedY
        this.fillCell(this.getCell(clickedX, clickedY), this.colors.selection)
        this.clearCell(this.getCell(this.clipWindow.xMax, this.clipWindow.yMax))
        this.clearCell(this.getCell(this.clipWindow.xMin, this.clipWindow.yMin))

        const poligonosDesenhados = this.elements.filter(e => e.tipo === 'poligono')
        poligonosDesenhados.forEach(poligono => {
          this.recortaPoligono(poligono, this.clipWindow)
        })
        this.$emit('updateFeature', 'recorte-poligono-inserir-bl')
      } else if (this.feature === 'escala-poligono') {
        const poligonosDesenhados = this.elements.filter(e => e.tipo === 'poligono')
        poligonosDesenhados.forEach(poligono => {
          this.transformaTamanhoPoligono({ x: clickedX, y: clickedY }, { x: this.escalaXValue, y: this.escalaYValue }, poligono)
        })
        this.$emit('updateFeature', 'normal')
      } else if (this.feature === 'rotacao-poligono') {
        const poligonosDesenhados = this.elements.filter(e => e.tipo === 'poligono')
        poligonosDesenhados.forEach(poligono => {
          this.giraPoligono({ x: clickedX, y: clickedY }, this.anguloRotacaoValue, poligono)
        })
        this.$emit('updateFeature', 'normal')
      }

      this.isBusy = false
    },

    desenhaLinha (origemX, origemY, destinoX, destinoY) {
      const novaLinha = { id: this.elements.length, tipo: 'linha', pontos: [] }
      novaLinha.pontos = bresenham(origemX, origemY, destinoX, destinoY)
      novaLinha.pontos.forEach(ponto => {
        this.fillCell(this.getCell(ponto.x, ponto.y), this.colors.draw)
      })
      this.elements.push(novaLinha)
    },
    desenhaCirculo (raio, xc, yc) {
      let pontosCirculo = []
      pontosCirculo = pontoMedio(raio, xc, yc)
      pontosCirculo.forEach(ponto => {
        this.fillCell(this.getCell(ponto.x, ponto.y), this.colors.draw)
      })
    },
    desenhaCurva (pontosControle) {
      const pontosBezier = curva(pontosControle)

      for (let t = 1; t <= 10; t++) {
        this.desenhaLinha(
          pontosBezier[t - 1].x,
          pontosBezier[t - 1].y,
          pontosBezier[t].x,
          pontosBezier[t].y
        )
      }
    },
    desenhaPolilinha (pontos) {
      console.log(pontos)
      pontos.push(pontos[0])
      const novoPoligono = { id: this.elements.length, tipo: 'poligono', pontosPoligono: [], pontos: [] }
      for (let i = 0; i < pontos.length - 1; i++) {
        novoPoligono.pontosPoligono.push({ x: pontos[i].x, y: pontos[i].y })
        novoPoligono.pontos = novoPoligono.pontos.concat(bresenham(
          pontos[i].x,
          pontos[i].y,
          pontos[i + 1].x,
          pontos[i + 1].y
        ))
      }
      novoPoligono.pontos.forEach(ponto => {
        this.fillCell(this.getCell(ponto.x, ponto.y), this.colors.draw)
      })
      this.elements.push(novoPoligono)
    },
    preencheRecursivamente (x, y) {
      const limite = Math.floor(this.quadrantGridSize / this.cellSize)
      if (Math.abs(x) <= limite && Math.abs(y) <= limite) {
        const ponto = this.getCell(x, y)

        if (ponto?.color !== this.colors.fill && ponto?.color !== this.colors.draw) {
          this.fillCell(ponto, this.colors.fill)

          this.preencheRecursivamente(x + 1, y)
          this.preencheRecursivamente(x, y + 1)
          this.preencheRecursivamente(x - 1, y)
          this.preencheRecursivamente(x, y - 1)
        }
      }
    },
    preencheVarredura () {
      const pontosCoordenadas = Object.keys(this.cells)
      const pontos = []
      pontosCoordenadas.forEach(coordenada => {
        if (this.cells[coordenada].color === this.colors.draw) {
          pontos.push(this.cells[coordenada])
        }
      })
      console.log(pontos)

      let xMin = Infinity
      let xMax = -Infinity
      let yMin = Infinity
      let yMax = -Infinity

      let pontosPreencher = []

      pontos.forEach((ponto) => {
        xMin = ponto.x < xMin ? ponto.x : xMin
        xMax = ponto.x > xMax ? ponto.x : xMax
        yMin = ponto.y < yMin ? ponto.y : yMin
        yMax = ponto.y > yMax ? ponto.y : yMax
      })

      pontosPreencher = varredura(pontos)

      pontosPreencher.forEach(ponto => {
        const busca = pontos.find(p => p.x === ponto.x && p.y === ponto.y)
        if (!busca) {
          this.fillCell(this.getCell(ponto.x, ponto.y), this.colors.fill)
        }
      })
    },
    recortaLinha (linha, janelaRecorte) {
      let pontosExcluir = []
      pontosExcluir = recorte(linha.pontos, janelaRecorte)

      pontosExcluir.forEach(ponto => {
        this.clearCell(this.getCell(ponto.x, ponto.y))
        linha.pontos = linha.pontos.filter(p => p.x !== ponto.x || p.y !== ponto.y)
      })

      if (pontosExcluir.length === linha.pontos.length) {
        this.elements = this.elements.filter(l => l.id !== linha.id)
      }
    },

    recortaPoligono (poligono, janelaRecorte) {
      let pontosExcluir = []
      pontosExcluir = recorte(poligono.pontos, janelaRecorte)

      pontosExcluir.forEach(ponto => {
        this.clearCell(this.getCell(ponto.x, ponto.y))
        poligono.pontos = poligono.pontos.filter(p => p.x !== ponto.x || p.y !== ponto.y)
        poligono.pontosPoligono = poligono.pontosPoligono.filter(p => p.x !== ponto.x || p.y !== ponto.y)
      })

      if (pontosExcluir.length === poligono.pontos.length) {
        this.elements = this.elements.filter(l => l.id !== poligono.id)
      }
    },

    deslocaPoligono (deslocamento, poligono) {
      const pontosPoligonoTransformado = translacao(deslocamento, poligono.pontos)
      poligono.pontos.forEach(ponto => {
        this.clearCell(this.getCell(ponto.x, ponto.y))
      })
      poligono.pontos = pontosPoligonoTransformado
      poligono.pontos.forEach(ponto => {
        this.fillCell(this.getCell(ponto.x, ponto.y), this.colors.draw)
      })
    },
    transformaTamanhoPoligono (pontoFixo, fatoresEscala, poligono) {
      const pontosPoligonoTransformado = escala(pontoFixo, fatoresEscala, poligono.pontosPoligono)
      poligono.pontos.forEach(ponto => {
        this.clearCell(this.getCell(ponto.x, ponto.y))
      })

      poligono.pontosPoligono = pontosPoligonoTransformado
      poligono.pontos = []
      for (let i = 0; i < poligono.pontosPoligono.length - 1; i++) {
        poligono.pontos = poligono.pontos.concat(bresenham(
          poligono.pontosPoligono[i].x,
          poligono.pontosPoligono[i].y,
          poligono.pontosPoligono[i + 1].x, poligono.pontosPoligono[i + 1].y
        ))
      }
      poligono.pontos = poligono.pontos.concat(bresenham(
        poligono.pontosPoligono[poligono.pontosPoligono.length - 1].x,
        poligono.pontosPoligono[poligono.pontosPoligono.length - 1].y,
        poligono.pontosPoligono[0].x,
        poligono.pontosPoligono[0].y
      ))

      poligono.pontos.forEach(ponto => {
        this.fillCell(this.getCell(ponto.x, ponto.y), this.colors.draw)
      })
    },
    giraPoligono (pivo, anguloRotacao, poligono) {
      const pontosPoligonoTransformado = rotacao(pivo, anguloRotacao, poligono.pontosPoligono)

      poligono.pontos.forEach(ponto => {
        this.clearCell(this.getCell(ponto.x, ponto.y))
      })

      poligono.pontosPoligono = pontosPoligonoTransformado
      poligono.pontos = []
      for (let i = 0; i < poligono.pontosPoligono.length - 1; i++) {
        poligono.pontos = poligono.pontos.concat(bresenham(
          poligono.pontosPoligono[i].x,
          poligono.pontosPoligono[i].y,
          poligono.pontosPoligono[i + 1].x,
          poligono.pontosPoligono[i + 1].y
        ))
      }
      poligono.pontos = poligono.pontos.concat(bresenham(
        poligono.pontosPoligono[poligono.pontosPoligono.length - 1].x,
        poligono.pontosPoligono[poligono.pontosPoligono.length - 1].y,
        poligono.pontosPoligono[0].x, poligono.pontosPoligono[0].y
      ))

      poligono.pontos.forEach(ponto => {
        this.fillCell(this.getCell(ponto.x, ponto.y), this.colors.draw)
      })
    },

    calculaDistancia (origem, destino) {
      return Math.floor(Math.sqrt((destino.x - origem.x) ** 2 + (destino.y - origem.y) ** 2))
    }
  }
})
</script>
  <style scoped></style>
