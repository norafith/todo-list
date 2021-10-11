import css from './index.css';
import { todoReset, findProject } from './todoLogic.js';
import { createTaskElement, createProjectElement, getTaskDataFromDOM, getProjectDataFromDOM, renderTab, renderProjectList, makeTabActive, renderMobileProjectList,resizeWindowFix } from './todoDOM.js';

// current tab listening
let currTab = 'Inbox';

if (localStorage.getItem('Inbox') === null) {
    todoReset();
}

function initTab(element) {
    currTab = element.textContent.trim();
    console.log('currTab: ', currTab);
}

const tabs = document.querySelectorAll('.tab');
tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
        initTab(e.target);
        renderTab(currTab);
        makeTabActive(e.target);
    });
});

// event listeners adding

const newTaskButton = document.querySelector('#create-task-btn');
newTaskButton.addEventListener('click', (e) => {
    createTaskElement(...getTaskDataFromDOM());
});

const newProjectButton = document.querySelector('#create-project-btn');
newProjectButton.addEventListener('click', (e) => {
    createProjectElement(getProjectDataFromDOM());
});

const mobileMenuOpenButton = document.querySelector('#mobile-menu-open');
mobileMenuOpenButton.addEventListener('click', (e) => {
    renderMobileProjectList();
})

// first rendering

renderTab(currTab);
makeTabActive(document.querySelector('#inbox'));
renderProjectList();
resizeWindowFix();

export { currTab, initTab }