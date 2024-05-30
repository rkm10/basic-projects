let data1 = {
      Name: ['raj', 'lak', 'dev', 'ragu', 'jatin'],
      Marks: [88, 90, 89, 90, 88],
      Fulldetails: [Name = ['raj', 'lak', 'dev', 'ragu', 'jatin'], Marks = [88, 90, 89, 90, 88]]
}
for (i = 0; i < data1.Name.length; i++) {
      console.log(data1.Name[i]);
}
for (i = 0; i < data1.Marks.length; i++) {
      console.log(data1.Marks[i]);
}

for (let name of data1.Name) {
      console.log(name);
}
for (let mark of data1.Marks) {
      console.log(mark);
}

console.log(data1);
data1
let marks = [85, 97, 44, 37, 76, 60];

let sum1 = 0;

for (let val of marks) {
      sum1 += val
}

let avg = sum1 / marks.length;
console.log(`avg marks of the class= ${avg}`);
let items = [250, 645, 300, 900, 50];
let i = 0;
for (let val of items) {
      console.log(`VALUE OF INDEX ${i} = ${val}`);
      let offer = val / 10;
      items[i] = items[i] - offer;
      console.log(`value after offer= ${items[i]}`);
      i++;
}

let Array = ['Bloomber', 'microsoft', 'uber', 'google', 'IBM', 'netflix']
Array.shift()
Array.splice(1, 1, 'ola')
Array.push('amazon')


function raj(str) {
      let count = 0;
      for (const char of str) {
            if (char === "a" || char === "e" || char === "i" || char === "o" || char === "u") {
                  count++;
            }
      }
      return count;
}


const countVowels = (str) => {
      let count = 0;
      for (const char of str) {
            if (char === "a" || char === "e" || char === "i" || char === "o" || char === "u") {
                  count++;
            }
      }
      return count;

}

let arrayofnovel = ["Ntp", "nom", 'nbp', "noq", "nbp"]

//most perfered in javascript
arrayofnovel.forEach(function myfunction(val, i, arrayofnovel) {
      console.log(val, i, arrayofnovel);
})

//most perfered in python
for (let val of arrayofnovel) {
      console.log(val)
}

for (i = 0; i < arrayofnovel.length; i++) {
      console.log(arrayofnovel[i]);
}

let squares = [2, 8, 9, 12, 54]
let calSquare = (squares) => {
      console.log(squares * squares);
}
let addSquare = (squares) => {
      console.log(squares + squares);
}
squares.forEach(calSquare)
squares.forEach(addSquare)

let square = [2, 8, 9, 12, 54]

const data = square.filter((val) => {
      return val > 3;
})

console.log(data);

const array1 = [10, 2, 3, 4]

const news = array1.reduce((res, curr) => { return res > curr ? res : curr })
console.log(news);


let stud = [90, 54, 65, 89, 99, 92, 93, 54, 57]

const toppers = stud.filter((val) => { return val > 90 })
console.log(toppers)

let n = prompt("enter a number: ");
let arr = [];
for (i = 1; i <= n; i++) {
      arr[i - 1] = i
}
console.log(arr);
const sum = arr.reduce((res, curr) => { return res + curr })
console.log(sum);
const fact = arr.reduce((res, curr) => { return res * curr })
console.log(fact);

click.addEventListener("click", clicked())


function clicked() {
      console.log('button is clicked through event listener');
}