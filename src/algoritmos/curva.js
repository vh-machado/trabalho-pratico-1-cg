export default function curva (pontosControle) {
  const bezier = (pontos) => {
    return (t) => {
      let a = pontos
      let b = []
      for (; a.length > 1; a = b) {
        b = []
        for (let i = 0; i < a.length - 1; i++) {
          b[i] = {
            x: a[i].x * (1 - t) + a[i + 1].x * t,
            y: a[i].y * (1 - t) + a[i + 1].y * t
          }
        }
      }
      return a[0]
    }
  }

  const aplicaBezier = bezier(pontosControle)

  const pontosBezier = []
  for (let t = 0; t <= 10; t++) {
    const resultado = aplicaBezier(t / 10)
    pontosBezier.push({ x: Math.floor(resultado.x), y: Math.floor(resultado.y) })
  }

  return pontosBezier
}
