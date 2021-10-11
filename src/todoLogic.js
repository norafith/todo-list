function Task(title, date) {
    this.title = title;
    this.date = date;
    this.completion = false;
}

function storeProject(projectTitle, arrOfTasks=[]) {
    localStorage.setItem(projectTitle, JSON.stringify(arrOfTasks));
}

function storeTask(projectTitle, taskObj) {
    let arrOfTasks = JSON.parse(localStorage.getItem(projectTitle));
    arrOfTasks.push(taskObj);
    localStorage.setItem(projectTitle, JSON.stringify(arrOfTasks));
}

function getProjectList() {
    return Object.keys(localStorage);
}

function findProject(projectTitle) {
    return JSON.parse(localStorage.getItem(projectTitle));
}

function findTask(taskTitle, projectTitle, returnWithProject=false) {
    let currProject = findProject(projectTitle);
    for (let task of currProject) {
        for (let property in task) {
            if (property == 'title' && task[property] == taskTitle) {
                if (returnWithProject) {
                    return [task, currProject];
                }
                return task;
            }
        }
    }
}

function changeCompletionState(taskTitle, projectTitle) {
    let [currTask, currProject] = findTask(taskTitle, projectTitle, true);
    currTask.completion = !currTask.completion;
    storeProject(projectTitle, currProject);
}

function deleteProjectStorage(projectTitle) {
    localStorage.removeItem(projectTitle);
}

function deleteTaskStorage(taskTitle, projectTitle) {
    let [currTask, currProject] = findTask(taskTitle, projectTitle, true);
    for (let i = 0; i < currProject.length; i++) {
        if (currProject[i] == currTask) {
            currProject.splice(i, 1);
            storeProject(projectTitle, currProject);
            return;
        }
    }
}


function todoReset() {
    localStorage.clear();
    storeProject('Inbox');
}

export { Task, storeProject, storeTask, deleteProjectStorage, deleteTaskStorage, changeCompletionState, todoReset, findTask, findProject, getProjectList };

