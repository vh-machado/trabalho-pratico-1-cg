export default function rotacao (pivo, angulo, pontosPoligono) {
  const pontosRotacionados = []
  const { x: xPivo, y: yPivo } = pivo

  pontosPoligono.forEach(ponto => {
    const { x, y } = ponto
    const xAlterado = x - xPivo
    const yAlterado = y - yPivo

    pontosRotacionados.push({
      x: xPivo + (xAlterado * Math.cos(angulo * Math.PI / 180) - yAlterado * Math.sin(angulo * Math.PI / 180)),
      y: yPivo + (xAlterado * Math.sin(angulo * Math.PI / 180) + yAlterado * Math.cos(angulo * Math.PI / 180))
    })
  })

  return pontosRotacionados.map(ponto => {
    return {
      x: Math.floor(ponto.x), y: Math.floor(ponto.y)
    }
  })
}
