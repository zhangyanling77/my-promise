// 状态值
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'
// promise的处理函数
const resolvePromise = (promise2, x, resolve, reject) => {
  // console.log(promise2, x, resolve, reject)
  // 处理x的类型来决定是调resolve或reject 必须要写得严谨
  if(promise2 === x) {
    return reject(new TypeError(`Chaining cycle detected for promise #<Promise>`))
  }
  // 判断x是否是普通值
  if((typeof x === 'object' && x != null) || typeof x === 'function') {
    // 可能是promise then
    try {
      let then = x.then
      let called // 默认没有调用成功和失败, 防止多次调用.只能成功或失败
      if(typeof then === 'function') {
        // 是promise
        then.call(x, y => { // 如果是个promise 就采用这个promise的结果 
          // 但这个y有可能还是一个promise 实现递归解析
          if(called) return
          called = true
          resolvePromise(promise2, y, resolve, reject)
        }, r => {
          if(called) return
          called = true
          reject(r)
        })
      } else { // 常量直接抛出去
        resolve(x)
      }
    } catch(e) { //取then抛出异常
      if(called) return
      called = true
      reject(e)
    }
  } else {
    resolve(x)
  }
  
} 

class Promise {
  constructor(executor){
    this.value = undefined
    this.reason = undefined
    this.status = PENDING
    // 成功和失败的队列
    this.onResolvedCallbacks = []
    this.onRejectedCallbacks = []

    let resolve = value => {
      if(value instanceof Promise){
        return value.then(resolve, reject) // 和resolvePromise的功能相同
      }
      if(this.status === PENDING) {
        this.value  = value
        this.status = FULFILLED
        this.onResolvedCallbacks.forEach(fn => fn()) // 发布
      }
    }

    let reject = reason => {
      if(this.status === PENDING) {
        this.reason = reason
        this.status = REJECTED
        this.onRejectedCallbacks.forEach(fn => fn())
      }
    }
    // 可能会发生异常
    try {
      executor(resolve, reject)
    } catch(e) {
      reject(e)
    }

  }
  // 原型上的方法
  then(onFullfilled, onRejected){
    // 可选参数
    onFullfilled = typeof onFullfilled === 'function' ? onFullfilled : val => val
    onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err }
    // 如果then方法调用后 应该返回一个新的Promise 递归调用
    let promise2 = new Promise((resolve, reject) => {
      // 应该在返回的promise中 取上一次的状态 来决定这个promise2是成功还是失败
      if(this.status === FULFILLED) { // 同步
        // 当前onFullfilled,onRejected不能在当前的上下文中执行,为了确保promise2存在 
        setTimeout(() => {
          try {// 将then中的方法执行 拿到返回值
            let x = onFullfilled(this.value) 
            // 需要判断x是不是promise,不能直接resolve
            resolvePromise(promise2, x, resolve, reject)
          } catch(e) {
            reject(e)
          }
        })     
      }
  
      if(this.status === REJECTED) { // 同步
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch(e) {
            reject(e)
          }
        })
      }
  
      if(this.status === PENDING) { // 异步
        this.onResolvedCallbacks.push(() => { // 订阅
          // todo ...
          setTimeout(() => {
            try {
              let x = onFullfilled(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch(e) {
              reject(e)
            }
          })
          
        })
  
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            } catch(e) {
              reject(e)
            }
          })
          
        })
      }
    })

    return promise2
    
  }

  catch(errorCallback) { // 其实就是then的一种,没有成功的then
    return this.then(null, errorCallback)
  }
}


module.exports = Promise
