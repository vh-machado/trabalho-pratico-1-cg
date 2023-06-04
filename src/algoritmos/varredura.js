export default function varredura (pontos) {
  const pontosPreencher = []

  let yMin = Infinity
  let yMax = -Infinity
  pontos.forEach(ponto => {
    yMin = ponto.y < yMin ? ponto.y : yMin
    yMax = ponto.y > yMax ? ponto.y : yMax
  })

  for (let y = yMin; y <= yMax; y++) {
    const intersecoes = []

    for (let i = 0; i < pontos.length; i++) {
      const { x: x1, y: y1 } = pontos[i]
      const { x: x2, y: y2 } = pontos[(i + 1) % pontos.length]

      if ((y1 <= y && y < y2) || (y2 <= y && y < y1)) {
        const xIntersecao = Math.floor(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1))
        intersecoes.push(xIntersecao)
      }
    }

    intersecoes.sort()

    for (let i = 0; i < intersecoes.length; i += 2) {
      const xInicio = intersecoes[i]
      const xFim = (i + 1) < intersecoes.length ? intersecoes[i + 1] : xInicio

      for (let x = xInicio; x <= xFim; x++) {
        pontosPreencher.push({ x, y })
      }
    }
  }
  return pontosPreencher
}
