export default function recorta (pontos, janelaRecorte) {
  const pontosExcluir = []
  const { xMin, yMin, xMax, yMax } = janelaRecorte

  pontos.forEach(ponto => {
    if (ponto.x > xMax) {
      pontosExcluir.push(ponto)
    } else if (ponto.x < xMin) {
      pontosExcluir.push(ponto)
    } else if (ponto.y > yMax) {
      pontosExcluir.push(ponto)
    } else if (ponto.y < yMin) {
      pontosExcluir.push(ponto)
    }
  })

  return pontosExcluir
}
