let DATA = "suckers doommed"

class User {
      constructor(name, email) {
            this.name = name;
            this.email = email;
      }

      viewData() {
            console.log("data:", DATA);
      }
}

class Admin extends User {
      constructor(name, email) {
            super(name, email)
      }
      editData() {
            DATA = "successfully doommed again"
      }
}

let std1 = new User("raj", "raj@gmail.com")
let std2 = new User("rajas", "rajas@gmail.com")

let admin = new Admin("admin", "admin@novel.com")