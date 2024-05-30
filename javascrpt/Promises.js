// function getData(dataId) {
//       return new Promise((resolve, reject) => {
//             setTimeout(() => {
//                   console.log("data", dataId);
//                   resolve("success")
//             }, 4000)
//       })
// }
// function getData1(dataId) {
//       return new Promise((resolve, reject) => {
//             setTimeout(() => {
//                   console.log("data", dataId);
//                   resolve("success")
//             }, 1000)
//       })
// }

// //----------1st method----///

// console.log("fecthing data 1......");
// let p1 = getData(2)
// p1.then((res) => {
//       console.log(res);
//       console.log("fecthcing data2 .....");
//       let p2 = getData(3)
//       p2.then((res) => {
//             console.log(res)
//       })
// })

// //----------2nd method----///

// console.log("fecthing data 1......");
// let p3 = getData1(2)
// p3.then((res) => {
//       console.log(res);
//       console.log("fecthcing data2 .....");
//       let p4 = getData1(3)
//       p4.then((res) => {
//             console.log(res)
//       })
// })

// //---------- simplified 3rd method----///

// console.log("fecthing data 1......");
// getData1(2).then((res) => {
//       console.log("fecthcing data2 .....");
//       getData1(3).then((res) => { })
// })

// //--------------------------//



function gettingData(dataId, getNextData) {
      return new Promise((resolve, reject) => {
            setTimeout(() => {
                  console.log("data", dataId);
                  resolve("success")
            }, 2000);
      });
}

//-------method 1--------//

// console.log("data is fetching.......");
// gettingData(1).then((res) => {
//       console.log(res);
//       gettingData(2).then((res) => {
//             console.log(res);
//       })
// })

//-------simplifed way method 1--------//

gettingData(1).then((res) => {
      return gettingData(2)
}).then(() => {
      return gettingData(3)
}).then((res) => {
      console.log(res);
})