<template>
  <div id="app">
    <qrcode-stream @decode="onDecode" ref='qrdetector' :camera='cameraStream'></qrcode-stream>
    <div class='top-bar'>
      <div :class='"cancel" + ((picMode)? " " : " hidden")' @click='clearPicture()'> Cancel </div>
      <div class="meter-name">{{ meterName }}</div>
      <div :class='"save" + ((picMode)? " " : " hidden")' @click='uploadPicture()'> Save </div>
    </div>
    <div class='bottom-bar'>
      <div :class='"shutter-button" + ((shutterOn)? " " : " disabled")' ref='shutter' @click='capturePhoto()'> </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'App',
  created () {
    // this.$refs.camera.style.display = 'none'
  },
  data () {
    return {
      shutterOn: false,
      picMode: false,
      meterName: '',
      cameraStream: 'auto',
      photoBlob: null
    }
  },
  methods: {
    onDecode (decodedString) {
      this.meterName = decodedString
      this.shutterOn = true
      // this.$refs.qrdetector.style.display = 'none'
      // this.$refs.camera.style.display = 'none'
    },
    dataURItoBlob (dataURI) {
      const binary = atob(dataURI.split(',')[1])
      const array = []
      for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i))
      }
      return new Blob([new Uint8Array(array)], { type: 'image/jpeg' })
    },
    capturePhoto () {
      this.picMode = true
      this.cameraStream = 'off'
      const data = this.camera.captureFrame()
      this.$refs.qrdetector.paintPauseFrame(data)
      // let data = this.$refs.qrdetector.$refs.trackingLayer.toDataURL('image/png')
      // console.log(this.$refs.qrdetector.$refs.pauseFrame)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = data.width
      canvas.height = data.height
      const idata = ctx.createImageData(data.width, data.height)
      idata.data.set(data.data)
      ctx.putImageData(idata, 0, 0)
      this.photoBlob = this.dataURItoBlob(canvas.toDataURL('image/jpeg'))
    },
    clearPicture () {
      this.cameraStream = 'auto'
      this.picMode = false
      this.photoBlob = null
    },
    uploadPicture () {
      const formData = new FormData()
      formData.append('meter', this.meterName)
      formData.append('photo', this.photoBlob)
      this.$http.post('/upload', formData, {
        headers: {
          'content-type': 'multipart/form-data'
        }
      })
      this.picMode = false
      this.meterName = ''
      this.cameraStream = 'auto'
      this.shutterOn = false
    }
  },
  computed: {
    camera: {
      get () {
        return this.$refs.qrdetector.cameraInstance
      }
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  width: 100%;
}

body {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}

.bottom-bar {
  position: absolute;
  left: 0px;
  bottom: 0px;
  width: 100%;
  height: 50px;
  background-color: black;
}

.shutter-button {
  position: absolute;
  left: calc(50% - 30px);
  bottom: 10px;
  width: 60px;
  height: 60px;
  background-color: white;
  border-radius: 30px;
}

.shutter-button.disabled {
  background-color: gray;
}

.top-bar {
  position: absolute;
  top: 0px;
  left: 0px;
  height: 50px;
  background-color: black;
  width: 100%;
}
.top-bar > * {
  display: inline;
}

.meter-name {
  position: absolute;
  color: white;
  top: 10px;
  left: calc(50% - 40px);
  width: 80px;
  text-align: center;
  font-size: 25px;
}

.cancel {
  position: absolute;
  top: 15px;
  left: 50px;
  color: white;
}
.save {
  position: absolute;
  top: 15px;
  right: 50px;
  color: white;
}

.hidden {
  display: none;
}
</style>
