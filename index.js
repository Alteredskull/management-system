const mysql = require("mysql");
const inquirer = require("inquirer");
const consoleTable = require('console.table');
var rolesArray, employeesArray, departmentArray, manager, id;

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Ohio52296",
  database: "employeeDB"
});

connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as id ${connection.threadId}\n`);
  console.log("Initiating employee management system");
  RoleResync();
});

function RoleResync() {
  rolesArray = [];
  var query = `SELECT DISTINCT title FROM role`;
  connection.query(query, function (err, res) {
    if (err) throw err;

    res.forEach(element => {
      rolesArray.push(element.title);
    });
    EmployeeResync();
  });
}

function EmployeeResync() {
  employeesArray = [];
  var query = `select  CONCAT_WS(" ",first_name,last_name) AS Employee FROM employees;`;
  connection.query(query, function (err, res) {
    if (err) throw err;

    res.forEach(element => {
      employeesArray.push(element.Employee);
    });
    DepartmentResync();
  });
}

function DepartmentResync() {
  departmentArray = [];
  var query = `select department_name FROM department`;
  connection.query(query, function (err, res) {
    if (err) throw err;

    res.forEach(element => {
      departmentArray.push(element.department_name);
    });
    start();
  });
}

function start() {

  inquirer
    .prompt([
      {
        type: "list",
        message: ("What action would you like to take?"),
        choices: ["View All Employees", "View All Employees By Department", "View All Employees By Manager", "Add Employee", "Remove Employee", "Update Employee Role", "Update Employee Manager", "View All Roles", "Add Role", "Remove Role", "View the total utilized budget of a department", "Exit"],
        name: "action",
      }
    ])
    .then(function (res) {
      switch (res.action) {
        case "View All Employees":
          viewEmployees("ORDER BY e.id");
          break;

        case "View All Employees By Department":
          viewEmployees("ORDER BY department_name");
          break;

        case "View All Employees By Manager":
          viewEmployees("ORDER BY Manager");
          break;

        case "Add Employee":
          addEmployee();
          break;

        case "Remove Employee":
          removeEmployee();
          break;

        case "Update Employee Role":
          updateRole();
          break;

        case "Update Employee Manager":
          managerSwap();
          break;

        case "View All Roles":
          viewRoles();
          break;

        case "Add Role":
          addRole();
          break;

        case "Remove Role":
          removeRole();
          break;

        case "View the total utilized budget of a department":
          budget();
          break;

        case "Exit":
          connection.end();
          break;
      }
    });
}

function viewEmployees(orderBy) {
  var query = `select e.id, e.first_name, e.last_name,title, department_name AS department, salary,  CONCAT_WS(" ",m.first_name,m.last_name) AS Manager FROM employees e LEFT JOIN employees m ON m.id = e.manager_id LEFT JOIN role ON e.role_id = role.id LEFT JOIN department ON department_id = department.id ${orderBy}`;
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    start();
  });
}

function viewRoles() {
  var query = `SELECT DISTINCT title AS Role FROM role ORDER BY title`;
  connection.query(query, function (err, res) {
    if (err) throw err;

    console.table(res);
    start();
  });
}

function addRole() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What role would you like to add?",
        name: "role",
      },
      {
        type: "input",
        message: "What is the salary for this role?",
        name: "salary",
      },
      {
        type: "list",
        message: "What department is this role in?",
        name: "department",
        choices: departmentArray,
      }

    ])
    .then(function (res) {

      const makePromise = new Promise(function (resolve, reject) {

        var query = `select id from department where department_name = ?`;
        connection.query(query, [res.department], function (err, resp) {
          department_id = resp[0].id;

          resolve();
        });
      });
      makePromise.then(function () {

        var query = `INSERT INTO role (title, salary, department_id)
      values ("${res.role}", ${res.salary}, ${department_id});`;
        connection.query(query, function (err, data) {
          if (err) throw err;
          console.log(`${res.role} added as a new role!`);
          RoleResync();

        });

      });
    });
}

async function addEmployee() {
  try {
    employeesArray.unshift("None");

    inquirer
      .prompt([
        {
          type: "input",
          message: "What is the employee's first name?",
          name: "firstName",
        },
        {
          type: "input",
          message: "What is the employee's last name?",
          name: "lastName",
        },
        {
          type: "list",
          message: "What is the employee's role?",
          name: "role_name",
          choices: rolesArray,
        },
        {
          type: "list",
          message: "Who is the employee's manager?",
          name: "manager_name",
          choices: employeesArray,
        }
      ])
      .then(async function (res) {

        role = res.role_name;
        firstName = res.firstName;
        lastName = res.lastName;

        if (res.manager_name === "None") {
          manager = 0;
          sql = 0;
        }

        else {
          const splitName = res.manager_name.split(" ");
          first = splitName[0];
          last = splitName[1];

          var query = `select id from employees where first_name = ? and last_name = ?`;
          sql = await connection.query(query, [first, last], function (err, results) {
            if (err) throw err;
            manager = results[0].id;
          });
        }

        var query = `select id from role WHERE role.title = ?`;
        const sql2 = await connection.query(query, [role], function (err, data) {
          if (err) throw err;
          id = data[0].id;
          InsertEmployee(sql, sql2);
        });
      });
  }
  catch (err) {
    console.log(err);
  }

function InsertEmployee(a, b) {
  var query = `insert into employees (first_name, last_name, role_id, manager_id)
              values ("${firstName}", "${lastName}", ${id}, ${manager})`;

  connection.query(query, function (err) {
    if (err) throw err;
    console.log(`${firstName} ${lastName} added as a new employee!`);
    RoleResync();
  });
}
}

function removeRole() {
  inquirer
    .prompt([

      {
        type: "list",
        message: "Which role would you like to remove?",
        name: "delete_Role",
        choices: rolesArray,
      }

    ])
    .then(function (res) {
      var query = `delete from role where title = ?`;
      connection.query(query, [res.delete_Role], function (err, results) {
        console.log(`deleted ${res.delete_Role} from roles!`);
        RoleResync();
      });
    });
}

function removeEmployee() {
  inquirer
    .prompt([

      {
        type: "list",
        message: "Which Employee do you want to remove?",
        name: "delete_Emp",
        choices: employeesArray,
      }

    ])
    .then(function (res) {

      const splitName = res.delete_Emp.split(" ");
      const first = splitName[0];
      const last = splitName[1];

      var query = `delete from employees where  first_name = ? and last_name = ?`;
      connection.query(query, [first, last], function (err, results) {
        console.log(`deleted ${res.delete_Emp} from employees!`);
        RoleResync();
      });

    });
}

function updateRole() {
  employeesArray.shift();
  var first, last, id;

  inquirer
    .prompt([
      {
        type: "list",
        message: "What employee's information would you like to update?",
        name: "employee_name",
        choices: employeesArray,
      },
      {
        type: "list",
        message: "What is this employee's new role?",
        name: "role_name",
        choices: rolesArray,
      },
    ])
    .then(function (res) {

      const makePromise = new Promise(function (resolve, reject) {
        var query = `select id from role WHERE role.title = ?`;
        connection.query(query, [res.role_name], function (err, data) {
          if (err) throw err;

          const splitName = res.employee_name.split(" ");
          first = splitName[0];
          last = splitName[1];
          id = data[0].id;
          resolve();
        });
      });

      makePromise.then(function () {

        var query = `UPDATE employees SET role_id = ? WHERE first_name = ? AND last_name = ?`;
        connection.query(query, [id, first, last], function (err, data) {
          if (err) throw err;
          console.log(`${first} ${last}'s role has been updated to: ${res.role_name}`);
          RoleResync();
        });
      });
    });
}

function managerSwap() {
  var managerArray = ["None",...employeesArray];
  var first, last, managerId;

  inquirer
    .prompt([
      {
        type: "list",
        message: "What employee's information would you like to update?",
        name: "employee_name",
        choices: employeesArray,
      },
      {
        type: "list",
        message: "Who is this employee's new manager?",
        name: "manager_name",
        choices: managerArray,
      }
    ])
    .then(function (res) {

      const makePromise = new Promise(function (resolve, reject) {
        const splitEmployee = res.employee_name.split(" ");
        first = splitEmployee[0];
        last = splitEmployee[1];
        if (res.manager_name === "None") {
          managerId = 0;
          resolve();
        }
        else {
        const splitManager = res.manager_name.split(" ");
        

        var query = `select id from employees WHERE first_name = ? AND last_name = ?`;
        connection.query(query, [splitManager[0], splitManager[1]], function (err, data) {
          if (err) throw err;
          managerId = data[0].id;
          resolve();
        });
      }
     
      });

      makePromise.then(function () {
        var query = `UPDATE employees SET manager_id = ? WHERE first_name = ? AND last_name = ?`;
        connection.query(query, [managerId, first, last], function (err, data) {
          if (err) throw err;
          console.log(`${first} ${last}'s  Manager been updated to: ${res.manager_name}`);
          RoleResync();
        });
      });
    });
}


function budget() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "Which epartment would you like to utilize the budget for?",
        name: "department",
        choices: departmentArray,
      },
    ])
    .then(function (res) {
      var query = `select  SUM(salary) AS budget
  FROM employees e LEFT JOIN employees m ON m.id = e.manager_id LEFT JOIN role ON e.role_id = role.id 
  LEFT JOIN department ON department_id = department.id WHERE department_name = ?`;
      connection.query(query, [res.department], function (err, data) {
        if (err) throw err;
        console.log(`The total utilized budget of the ${res.department} department is ${data[0].budget}`);
        RoleResync();
      });
    });
}