import { Task, storeProject, storeTask, findTask, findProject, changeCompletionState, deleteTaskStorage, deleteProjectStorage, getProjectList } from './todoLogic.js';
import { currTab, initTab } from './index.js';
import format from 'date-fns/format';
import isToday from 'date-fns/isToday';

function getTaskDataFromDOM() {
    const taskTitleInputField = document.querySelector('#task-title-input');
    const taskDateInputField = document.querySelector('#task-date-input');

    let res = [taskTitleInputField.value, taskDateInputField.value];
    taskTitleInputField.value = '';
    taskDateInputField.value = '';

    return res;
}

function createTaskElement(taskTitle, taskDate, taskCompletion=false, rendering=false, tab=currTab) {
    const taskListContainer = document.querySelector('#all-task-container');

    function createButtons(mainContainer) {
        function deleteTaskElement() {
            for (let taskElement of taskListContainer.childNodes) {
                if (!taskElement.firstChild.firstChild) continue;  // always get a taskTitle element, because it is always comes first
                if (taskElement.firstChild.firstChild.textContent == taskTitle) {
                    taskListContainer.removeChild(taskElement);
                    return;
                }
            }
        }

        function changeCompleteButtonState(e) {
            if (e.target.classList.contains('done')) {
                e.target.classList.remove('done');
                e.target.classList.add('undone');
            }
            else {
                e.target.classList.remove('undone');
                e.target.classList.add('done');
            }
            let taskTitle = e.target.parentNode.parentNode.firstChild.firstChild.textContent; // always get a taskTitle element, because it is always comes first
            changeCompletionState(taskTitle, tab);
        }

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('task-btn-container');

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-btn');
        deleteButton.addEventListener('click', (e) => {
            deleteTaskElement();
            deleteTaskStorage(taskTitle, tab);
        });

        const completeButton = document.createElement('button');
        completeButton.classList.add('complete-task-btn');
        if (taskCompletion) {
            completeButton.classList.add('done');
        } else {
            completeButton.classList.add('undone');
        }
        completeButton.addEventListener('click', changeCompleteButtonState);

        mainContainer.appendChild(buttonContainer)

        buttonContainer.appendChild(deleteButton);
        buttonContainer.appendChild(completeButton);
    }

    if (!taskTitle || !taskDate) {
        alert('Can\'t get all data to create the task.');
        return;
    };

    if (!rendering && (taskTitle.length < 4 || taskTitle.length > 16)) {
        alert('Task title is too short or too long.');
        return;
    } 

    if (!rendering && findTask(taskTitle, tab)) {
        alert('Task with this title already exists.');
        return;
    }

    const newTaskContainer = document.createElement('div');
    newTaskContainer.classList.add('task-container');
        
    const taskTitleElement = document.createElement('span');
    taskTitleElement.classList.add('task-title');
    taskTitleElement.textContent = taskTitle;

    const taskDateElement = document.createElement('span');
    taskDateElement.classList.add('task-date');
    let taskDateObj = new Date(taskDate);
    taskDateElement.textContent = format(taskDateObj, 'dd.MM.yyyy HH:mm');;

    taskListContainer.appendChild(newTaskContainer);
    newTaskContainer.appendChild(taskTitleElement);
    newTaskContainer.appendChild(taskDateElement);
    createButtons(newTaskContainer);

    if (!rendering) storeTask(tab, new Task(taskTitle, taskDate));
    
}

function getProjectDataFromDOM() {
    const projectTitleInputField = document.querySelector('#project-title');

    let res = projectTitleInputField.value;

    projectTitleInputField.value = '';

    return res;
}

function createProjectElement(projectTitle, rendering=false) {
    const projectListContainer = document.querySelector('#project-list');
    
    function deleteProjectElement() {
        if (projectTitle == currTab) clearTaskListContainer();

        for (let projectElement of projectListContainer.childNodes) {
            if (!projectElement.firstChild) continue;  // always get a projectTitle element, because it is always comes first
            if (projectElement.firstChild.textContent == projectTitle) {
                projectListContainer.removeChild(projectElement);
                return;
            }
        }
    }

    if (!projectTitle) {
        alert('Can\'t get all data to create a project.');
        return;
    }

    if (!rendering && (projectTitle.length < 4 || projectTitle.length > 11)) {
        alert('Project title is too short or too long.');
        return;
    } 

    if (!rendering && findProject(projectTitle)) {
        alert('Project with this name already exists.');
        return;
    }

    const newProjectContainer = document.createElement('div');
    newProjectContainer.classList.add('tab');
    newProjectContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) return; 

        if (e.target.tagName == 'DIV') makeTabActive(e.target)
        else makeTabActive(e.target.parentNode);
    });
    newProjectContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) return;

        initTab(e.target.firstChild);
        renderTab(currTab);
    });


    const projectTitleElement = document.createElement('span');
    projectTitleElement.textContent = projectTitle;

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-btn');
    deleteButton.addEventListener('click', (e) => {
        deleteProjectElement();
        deleteProjectStorage(projectTitle);
    })

    projectListContainer.appendChild(newProjectContainer);
    newProjectContainer.appendChild(projectTitleElement);
    newProjectContainer.appendChild(deleteButton);
    
    if (!rendering) storeProject(projectTitle);
}

function clearTaskListContainer() {
    const taskListContainer = document.querySelector('#all-task-container');
    while (taskListContainer.lastChild) {
        taskListContainer.removeChild(taskListContainer.lastChild);
    }
}

function renderTab(tabTitle) {
    clearTaskListContainer();

    if (tabTitle == 'Today') {
        for (let project of getProjectList()) {
            for (let task of findProject(project)) {
                if (isToday(new Date(task.date))) {
                    createTaskElement(task.title, task.date, task.completion, true);
                }
            }
        }
        return;
    }
    
    let currProject = findProject(tabTitle);
    
    for (let task of currProject) {
        createTaskElement(task.title, task.date, task.completion, true);
    }
}

function renderProjectList() {
    for (let projectTitle of getProjectList()) {
        if (projectTitle == 'Inbox') continue;
        createProjectElement(projectTitle, true);
    }
}

function makeTabActive(tabElement) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach((tab) => {
        tab.classList.remove('active-tab');
    })

    tabElement.classList.add('active-tab');
}

function renderMobileProjectList() {
    const tabsContainer = document.querySelector('#tabs-container');
    const taskSection = document.querySelector('#task-section');
    if (window.getComputedStyle(tabsContainer).display == 'none') {
        tabsContainer.setAttribute('style', 'display: flex;');
        taskSection.setAttribute('style', 'display: none;')
    } else {
        tabsContainer.setAttribute('style', 'display: none;')
        taskSection.setAttribute('style', 'display: flex;')
    };
}

function resizeWindowFix() {
    window.onresize = () => {
        if (window.innerWidth > 700) {
            const taskSection = document.querySelector('#task-section');
            const tabsContainer = document.querySelector('#tabs-container')
            taskSection.setAttribute('style', '');
            tabsContainer.setAttribute('style', '')
        }
    }
}


export { createTaskElement, createProjectElement, getTaskDataFromDOM, getProjectDataFromDOM, renderTab, renderProjectList, makeTabActive, renderMobileProjectList, resizeWindowFix };