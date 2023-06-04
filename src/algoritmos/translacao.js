export default function (deslocamento, pontosPoligono) {
  const { x: xT, y: yT } = deslocamento
  const pontosPoligonoTransformado = []

  pontosPoligono.forEach(ponto => {
    const { x, y } = ponto
    pontosPoligonoTransformado.push({
      x: (x + xT),
      y: (y + yT)
    })
  })

  return pontosPoligonoTransformado
}
