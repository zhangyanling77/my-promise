// generator 生成器 es6语法
// async / await 替代了它
// redux-saga 使用它实现

// 返回值叫迭代器 iterator

// function * read() {
//   yield 1; // 产出
//   yield 2;
// }

// // iterator
// let it = read()

// console.log(it.next()) // { value: 1, done: false } value: 值, done: 是否完成
// console.log(it.next()) 
// console.log(it.next()) 

// 将类数组转化为数组
// 类数组的定义: 1.索引 2.长度 length
// 迭代器 是有next方法 且方法执行后需要返回value, done
function add() {
  // console.log([...arguments])
  console.log([
    ...
    {
      0:1, 
      1: 2, 
      length: 2,
      [Symbol.iterator]: function *() {
        let index = 0
        while(index !== this.length) {
          yield this[index++]
        }
      }
    //   [Symbol.iterator](){
    //   let len = this.length
    //   let index = 0
    //   return {
    //     next: () => {
    //       return {
    //         value: this[index++], 
    //         done: index === len + 1
    //       }
    //     }
    //   }
    // }
  }
])
}

add(1, 2, 3, 4, 5)

/**
 * 注意a,b,c并不是赋值
 */

function * read() {
  try {
    let a = yield 1
    console.log(a) // undefined

    let b = yield 2;
    console.log(b) // undefined

    let c = yield 3;
    console.log(c) // undefined
  } catch(e) {
    console.log(e)
  }
}

let it = read()
console.log(it.next()) // 第一次next传参无意义
// it.throw('xxx') // 抛错后续不再执行了
console.log(it.next(100))
console.log(it.next())
console.log(it.next())

/*
{ value: 1, done: false }
100
{ value: 2, done: false }
undefined
{ value: 3, done: false }
undefined
{ value: undefined, done: true } 
 */


const fs = require('fs').promises

function * read() {
  let content = yield fs.readFile('./name.txt','utf8')
  let age = yield fs.readFile(content, 'utf8')
  let xxx = yield { age: age + 10}
  return xxx
}
// ||
// \/
async function read() {
  let content = await fs.readFile('./name.txt','utf8')
  let age = await fs.readFile(content, 'utf8')
  let xxx = await { age: age + 10}
  return xxx
}

// let it = read()
// it.next().value.then(data => {
  
//   it.next(data).value.then(data => {
//     let r = it.next(data)
//     console.log(r.value)
//   })
// })

// co库解决上面的嵌套问题  先安装 解决异步并发问题
// let co = require('co')

// 实现co
function co(it) {
  return new Promise((resolve, reject) => {
    // 异步迭代需要先提供一个next方法
    function next(){
      let { value, done } = it.next()
      if(!done){
        Promise.resolve(value).then(data => {
          next(data)
        }, err => {
          reject(err)
        })
      } else {
        resolve(value)
      }
    }
    next()
  })
}

co(read()).then(data => {
  console.log(data)
})
