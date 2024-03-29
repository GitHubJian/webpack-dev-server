module.exports = class CorsPlugin {
  constructor({ publicPath, crossorigin, integrity }) {
    this.crossorigin = crossorigin
    this.integrity = integrity
    this.publicPath = publicPath
  }

  apply(compiler) {
    const ID = `vue-cli-cors-plugin`
    compiler.hooks.compilation.tap(ID, compilation => {
      const ssri = require('ssri')

      const computeHash = url => {
        const filename = url.replace(this.publicPath, '')
        const asset = compilation.assets[filename]
        if (asset) {
          const src = asset.source()
          const integrity = ssri.fromData(src, {
            algorithms: ['sha384']
          })
          return integrity.toString()
        }
      }

      compilation.hooks.htmlWebpackPluginAlterAssetTags.tap(ID, data => {
        const tags = [...data.head, ...data.body]
        if (this.crossorigin != null) {
          tags.forEach(tag => {
            if (tag.tagName === 'script' || tag.tagName === 'link') {
              tag.attributes.crossorigin = this.crossorigin
            }
          })
        }

        if (this.integrity) {
          tags.forEach(tag => {
            if (tag.tagName === 'script') {
              const hash = computeHash(tag.attributes.src)
              if (hash) {
                tag.attributes.integrity = hash
              }
            } else if (
              tag.tagName === 'link' &&
              tag.attributes.rel === 'stylesheet'
            ) {
              const hash = computeHash(tag.attributes.href)
              if (hash) {
                tag.attributes.integrity = hash
              }
            }
          })

          data.head = data.head.filter(tag => {
            return !(tag.tagName === 'link' && tag.attributes.rel === 'preload')
          })
        }
      })

      compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tap(ID, data => {
        data.html = data.html.replace(/\scrossorigin=""/g, ' crossorigin')
      })
    })
  }
}
