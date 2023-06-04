function desenha8 (x, y, xc, yc) {
  const pontos = []
  pontos.push({ x: x + xc, y: y + yc })
  pontos.push({ x: y + xc, y: x + yc })
  pontos.push({ x: y + xc, y: -x + yc })
  pontos.push({ x: x + xc, y: -y + yc })
  pontos.push({ x: -x + xc, y: -y + yc })
  pontos.push({ x: -y + xc, y: -x + yc })
  pontos.push({ x: -y + xc, y: x + yc })
  pontos.push({ x: -x + xc, y: y + yc })
  return pontos
}
export default function pontoMedio (r, xc, yc) {
  let pontosCirculo = []
  let x = 0
  let y = r
  let e = -r

  pontosCirculo = pontosCirculo.concat(desenha8(x, y, xc, yc))
  while (x <= y) {
    e += 2 * x + 1
    x++
    if (e >= 0) {
      e += 2 - 2 * y
      y--
    }
    pontosCirculo = pontosCirculo.concat(desenha8(x, y, xc, yc))
  }

  return pontosCirculo
}
