var p1 = function(d) {
  return new Promise(r => {
    r(d)
  })
}

var p2 = function(d) {
  return new Promise(r => {
    r(d + 3)
  })
}

var p3 = function(d) {
  return new Promise(r => {
    r(d + 5)
  })
}

var b = [p1, p2, p3]
  .reduce((prev, v) => {
    var x = prev.then(r => {
      debugger
      r || (r = 1)
      var t = v(r)
      return t
    })

    return x
  }, Promise.resolve())
  .then(res => {
    console.log(res)
  })
