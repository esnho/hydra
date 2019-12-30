const repl = require('./repl.js')


class Menu {
  constructor (obj) {
    this.sketches = obj.sketches
    this.editor = obj.editor
    this.hydra = obj.hydra
    this.storageUI = new StorageUI()

    // variables related to popup window
    this.closeButton = document.getElementById("close-icon")
    this.clearButton =  document.getElementById("clear-icon")
    this.shareButton =  document.getElementById("share-icon")
    this.shuffleButton = document.getElementById("shuffle-icon")
    this.saveButton = document.getElementById("save-icon")
    this.editorText = document.getElementsByClassName('CodeMirror-scroll')[0]

    this.shuffleButton.onclick = this.shuffleSketches.bind(this)
    this.shareButton.onclick = this.shareSketch.bind(this)
    this.clearButton.onclick = this.clearAll.bind(this)
    this.saveButton.onclick = this.updateSketchURL.bind(this)
    this.closeButton.onclick = () => {
      if(!this.isClosed) {
        this.closeModal()
      } else {
        this.openModal()
      }
    }

    this.isClosed = false
    this.closeModal()
  }

  shuffleSketches() {
    this.clearAll()
    this.sketches.setRandomSketch()
    this.editor.setValue(this.sketches.code)
    repl.eval(this.editor.getValue())
  }

  shareSketch() {
      repl.eval(this.editor.getValue(), (code, error) => {
        console.log('evaluated', code, error)
        if(!error){
          this.showConfirmation( (name) => {
            this.sketches.shareSketch(code, this.hydra, name)
          }, () => this.hideConfirmation() )
        }
      })
  }

  updateSketchURL() {
    repl.eval(this.editor.getValue(), (code, error) => {
      if (error) {
        window.alert(error)
        return
      }
      console.log("UPDATIMG SKETCH URL")
      Storage.saveCode(code)
      Storage.getSavedNames()
//      window.history.pushState("object or string", "Page Title", "/?code="+this.encodeBase64(code) );
    })
  }

  showConfirmation(successCallback, terminateCallback) {
    var c = prompt("Pressing OK will share this sketch to \nhttps://twitter.com/hydra_patterns.\n\nInclude your name or twitter handle (optional):")
    console.log('confirm value', c)
    if (c !== null) {
      successCallback(c)
    } else {
      terminateCallback()
    }
  }

  hideConfirmation() {

  }

  clearAll() {
    hush()
    this.sketches.clear()
    this.editor.clear()
    //@todo: add clear/reset function to hydra
  }

  closeModal () {
    document.getElementById("info-container").className = "hidden"
    this.closeButton.className = "fas fa-question-circle icon"
    this.shareButton.classList.remove('hidden')
    this.clearButton.classList.remove('hidden')
    this.saveButton.classList.remove('hidden')
    this.editorText.style.opacity = 1
    this.isClosed = true
  }

  openModal () {
    document.getElementById("info-container").className = ""
    this.closeButton.className = "fas fa-times icon"
    this.shareButton.classList.add('hidden')
    this.clearButton.classList.add('hidden')
    this.saveButton.classList.add('hidden')
    this.editorText.style.opacity = 0.0
    this.isClosed = false
  }

}

class StorageUI {

  constructor() {
    const storageUI = document.createElement('div')
    storageUI.appendChild(this.createSavedList())

    window.document.body.appendChild(storageUI)
  }

  createSavedList() {
    const storageList = document.createElement('ul')
    Storage.getSavedNames().map((name) => {
      const savedName = document.createElement('li')
      savedName.innerText = Storage.getTitleFor(name)
      savedName.onclick = () => {
        console.log(Storage.getCodeFor(name))
      }
      storageList.appendChild(savedName)
    })
    storageList.style.position = 'absolute'
    storageList.style.zIndex = 999
    storageList.style.cursor = 'pointer'
    storageList.style.padding = '1em'
    storageList.style.left = 'calc(100vw - 100%)'
    storageList.style.background = 'black'
    return storageList
  }
}

class Storage {
  static saveCode(code) {
    const savedCode = {
      title: code.split('\n')[0],
      code: Storage.encodeBase64(code),
    }
    window.localStorage.setItem(Date(), JSON.stringify(savedCode))
  }

  static getSavedNames() {
    const storageEntries = Object.entries(window.localStorage)
    const names = storageEntries.map((entry) => {
      return entry[0]
    })
    console.log(names)
    return names
  }

  static getEntryFor(name) {
    try {
      const storageEntries = Object.entries(window.localStorage)
      return JSON.parse(storageEntries.filter((value) => {
        return value[0] === name
      })[1])
    } catch(e) {
      return {}
    }
  }
  
  static getCodeFor(name) {
    Storage.getEntryFor(name).code
  }

  static getTitleFor(name) {
    Storage.getEntryFor(name).title
  }

  static encodeBase64(text) {
    return btoa(encodeURIComponent(text))
  }

  static decodeBase64(base64Code) {
    return decodeURIComponent(atob(base64Code))
  }
}

module.exports = Menu
