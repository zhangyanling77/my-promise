// promise.all 全部 处理多个异步并发的问题
let fs = require('fs').promises

const isPromise = value => {
  if((typeof value === 'object' && value !== null) || typeof value === 'function') {
    return typeof value.then === 'function'
  }
  return false
}

Promise.all = function(promises) {

  return new Promise((resolve, reject) => {
    let arr = [] // 存放最终的结果
    let Index = 0
    let processData = (index, data) => {
      arr[index] = data // 将数据放入数组中, 成功的数量和传入的数量相等,将结果抛出
      if(++Index === promises.length) [
        resolve(arr)
      ]
    } 

    for(let i = 0; i < promises.length; i++) {
      let current = promises[i] // 获取当前每一项
      if(isPromise(current)) { // 如果是peomise
        current.then(data => {
          processData(i, data)
        }, reject)
      } else {
        processData(i, current)
      }
    }
  })
}

// 全部完成才算完成, 如果有一个失败就失败
// Promise.all按顺序执行
Promise.all(fs.readFile('./age.txt', 'utf8'), fs.readFile('./name.txt', 'utf8')).then(data => {
  console.log(data) // 结果数组
}, err => {
  console.log(err)
})

// Promise.race 有一个成功就成功, 有一个失败就失败
