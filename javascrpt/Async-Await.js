function getData(dataId) {
      return new Promise((resolve, reject) => {
            setTimeout(() => {
                  console.log("data", dataId);
                  resolve("success")
            }, 2000)
      })
}

//---------default method--------//

async function getAllData() {
      console.log("getting data 1...");
      await getData(1);
      console.log("getting data 2...");
      await getData(2);
      console.log("getting data 3...");
      await getData(3);
}

//An IIFE (Immediately Invoked Function Expression)//
//------------function method----------//

(async function () {
      console.log("getting data 1...");
      await getData(1);
      console.log("getting data 2...");
      await getData(2);
      console.log("getting data 3...");
      await getData(3);
})();

//------------- method-----------//

(() => {
      console.log("getting data 1...");
      getData(1);
      console.log("getting data 2...");
      getData(2);
      console.log("getting data 3...");
      getData(3);
})();

//------------- method-----------//

(async () => {
      console.log("getting data 1...");
      await getData(1);
      console.log("getting data 2...");
      await getData(2);
      console.log("getting data 3...");
      await getData(3);
})();