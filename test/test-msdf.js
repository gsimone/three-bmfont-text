global.THREE = require('three')
var createOrbitViewer = require('three-orbit-viewer')(THREE)
var shuffle = require('array-shuffle')
var createText = require('../')
var MSDFShader = require('../shaders/msdf')
var palettes = require('nice-color-palettes')
var palette = palettes[5]
var background = palette.shift()

require('./load')({
  font: 'fnt/Roboto-msdf.json',
  image: 'fnt/Roboto-msdf.png'
}, start)

function start (font, texture) {
  var app = createOrbitViewer({
    clearColor: '#000',
    clearAlpha: 1.0,
    fov: 65,
    position: new THREE.Vector3()
  })

  app.camera = new THREE.OrthographicCamera()
  app.camera.left = 0
  app.camera.top = 0
  app.camera.near = -1
  app.camera.far = 1000

  var container = new THREE.Object3D()
  app.scene.add(container)
  createGlyph()

  var time = 0
  // update orthographic
  app.on('tick', function (dt) {
    time += dt / 1000

    container.children.forEach((child, i) => {
      child.position.y += Math.sin(time * 2 + i / 4)
      child.material.uniforms.time.value = time
    })



    // update camera
    var width = app.engine.width
    var height = app.engine.height
    app.camera.left = -width / 2
    app.camera.right = width / 2
    app.camera.top = -height / 2
    app.camera.bottom = height / 2
    app.camera.updateProjectionMatrix()
  })

  function createGlyph () {
    
    const text ="Lorem Ipsum"

    var geom = createText({
      text,
      font: font,
      align: 'left',
      flipY: texture.flipY
    })

    const chars = text.split('')

    var material = new THREE.RawShaderMaterial(MSDFShader({
      map: texture,
      transparent: true,
      color: "white"
    }))

    var layout = geom.layout
    
    const myUVs = new THREE.BufferAttribute(new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]), 2)
     
    chars.forEach((_, i) => {
      const charGeom = createText({
        text: _,
        font,
        align: "left",
        flipY: texture.flipY
      })

      charGeom.setAttribute('myUVs', myUVs) 
      
      const charMesh = new THREE.Mesh(charGeom, material)

      charMesh.position.set(layout.glyphs[i].position[0], -layout.descender + layout.height, 1)
      container.add(charMesh)
    })

  }
}
