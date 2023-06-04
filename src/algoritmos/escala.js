export default function escala (pontoFixo, fatoresEscala, pontosPoligono) {
  const { x: xFator, y: yFator } = fatoresEscala
  const pontosEscalados = []

  pontosPoligono.forEach(ponto => {
    const { x, y } = ponto
    const xEscalado = pontoFixo.x + (x - pontoFixo.x) * xFator
    const yEscalado = pontoFixo.y + (y - pontoFixo.y) * yFator
    pontosEscalados.push({ x: xEscalado, y: yEscalado })
  })

  return pontosEscalados
}
