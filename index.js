var mysql2 = require("mysql2");
var inquirer = require("inquirer");
// const cTable = require("console.table");


var connection = mysql2.createConnection({ 
  host:"localhost",
  port:3306, 
  user: "root",
  password: "",
  database: "employee_DB"
})

connection.connect(function (err) {
  if (err) throw err
  startApp()
});

function startApp() {
  inquirer.prompt([
    {
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a new department",
        "Add a new role",
        "Add a new employee",
        "Update employee roles",
        "Exit"
      ]
    }])
    .then(function (answer) {
      switch (answer.action) {
        case "View all departments":
          viewDepartments();
          break;
        case "View all roles":
          viewRoles();
          break;
        case "View all employees":
          viewEmployees();
          break;
        case "Add a new department":
          addDepartment();
          break;
        case "Add a new role":
          addRole();
          break;
        case "Add a new employee":
          addEmployee();
          break;
        case "Update employee roles":
          selectEmp();
          break;
        case "exit":
          connection.end();
          break;
      }
    });
};

//called in addContent function if selected dept
function viewDepartments() {
  connection.query(`SELECT * FROM departments`, function (err, res) {
    if (err) throw err;
    console.table(res);
    startApp();
  })
}

function viewRoles () {
  connection.query(`SELECT * FROM roles`, function (err,res) {
    if (err) throw err;
    console.table(res);
    startApp();
  })

}

function viewEmployees () {
  connection.query(`SELECT * FROM employees`, function (err,res) {
    if (err) throw err;
    console.table(res);
    startApp();
  })

}


//called in addContent function if selected role
function addRole() {
  connection.query("SELECT * FROM departments", function (err, res) {
    if (err) throw err;
    //asking for the three properties on the roles table      
    inquirer.prompt([
      {
        name: "title",
        type: "input",
        message: "What is the title of the new role?"
      },
      {
        name: "salary",
        type: "number",
        message: "What is the salary of this position?",
      },
      {
        name: "deptId",
        type: "rawlist",
        message: "Select a department for this role",
        choices: res.map(department => department.name)
      }
    ]).then(function (response) {
      const selectedDept = res.find(dept => dept.name === response.deptId);
      connection.query("INSERT INTO roles SET ?",
        {
          title: response.title,
          salary: response.salary,
          dept_id: selectedDept.id
        },
        function (err, res) {
          if (err) throw err;
          console.log("New role added!\n");
          startApp();
        }
      );
    });
  })
};

function addEmployee (){
  connection.query("SELECT * FROM roles", function (err,res){
if (err) throw err
inquirer.prompt([ 
  { 
    type: "input",
    name: "First_Name",
    message: "What is the first name of the employee?"
  },
  { 
    type: "input",
    name: "Last_Name",
    message: "What is the last name of the employee?"
  },
  { 
    type: "list",
    name: "Role_ID",
    message: "What role will this employee have?",
    choices: res.map(role=>role.title)
  },
  // { 
  //   type: "list",
  //   name: "Manager_ID",
  //   message: "What is the managers ID?",
  //   choices: res.map(employee=>employee.manager_ID)
  // },

]).then(response=>{
  var selectedRole = res.find(role=>role.title===response.Role_ID)
  connection.query("INSERT into employees SET ?", {
first_name: response.First_Name,
last_name: response.Last_Name,
role_id: selectedRole.id
    
  },function(){
    console.log("new employee added")
    startApp()
  })
})

  })
}

;



function selectEmp() {
  connection.query("SELECT * FROM employees", function (err, res) {
    if (err) throw err;
    inquirer.prompt([
      {
        type: "rawlist",
        name: "selectEmp",
        message: "Select the employee who is changing roles",
        choices: res.map(emp => emp.first_name)
      }
    ]).then(function (answer) {
      const selectedEmp = res.find(emp => emp.first_name === answer.selectEmp);
      connection.query("SELECT * FROM roles", function (err, res) {
        inquirer.prompt([
          {
            type: "rawlist",
            name: "newRole",
            message: "Select the new role for this employee",
            choices: res.map(item => item.title)
          }
        ]).then(function (answer) {
          const selectedRole = res.find(role => role.title === answer.newRole);

          connection.query("UPDATE employees SET role_id = ? WHERE id = ?", [selectedRole.id, selectedEmp.id],
            function (error) {
              if (error) throw err;
              start();
            }
          );
        })
      })
    })
  })
};


