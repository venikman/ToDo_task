const storage = localStorage;
const state = {
	items: JSON.parse(storage.getItem('data')) || []
};
const parsedTasks = state.items;

const save = () => {
	storage.setItem('data', JSON.stringify(state.items));
};

// Fuction for adding data for state.
function addToState(taskText) {
	if (!taskText || typeof taskText !== 'string') {
		throw new TypeError('Expected task text, got: ' + taskText);
	}
	const date = getDate();
	addTask(createTask(taskText, date));
	state.items.push({
		text : taskText,
		date
	});
	save();
}
// Take date, month and time.
function getDate() {
	return moment().format('h:mma D MMMM');
}
// Add new  list tag to the list. 
function addTask(task) {
	if (!task || typeof task !== 'object') {
		throw new TypeError('Expected a task, got: ' + task);
	}
	const tasks = document.querySelector('#ul');
	tasks.appendChild(task);
};
// This is a hack. Replace this with proper index lookup.
const findTaskByText = (text) => {
	return parsedTasks.findIndex((x) => {
		const spaceIndex = text.indexOf(' ');
		const firstWord = text.substring(0, spaceIndex >= 0 ? spaceIndex : text.length)
		return x.text.startsWith(firstWord)
	});
};
// Create button to delete li tag from list.
function createTaskRemover() {
	const removeBtn = document.createElement('span');
	removeBtn.textContent = '🗑';
	removeBtn.addEventListener('click', (evt) => {
		const task = evt.target.parentNode;
		task.remove();
		const taskIndex = findTaskByText(task.textContent)
		parsedTasks.splice(taskIndex, 1);
		save();
	});
	return removeBtn;
}
// Create list tag with text and time.
function createTask(text, date, done) {
	if (!text || typeof text !== 'string') {
		throw new TypeError('Expected task text, got: ' + text);
	}
	if (!date || typeof date !== 'string') {
		throw new TypeError('Expected task date, got: ' + date);
	}
	const task = document.createElement('li');
	task.textContent = `${text} Created at: ${date}`;
	task.addEventListener('click', (evt) => {
		evt.target.classList.toggle('lineThr');
		const taskIndex = findTaskByText(text);
		state.items[taskIndex].done = !state.items[taskIndex].done;
		save();
	});
	if (done) task.classList.add('lineThr');
	task.classList.add('list-group-item');
	task.appendChild(createTaskRemover());
	return task;
};

// Make eventListener for loading speed and security. 
addEventListener('load', () => {
	console.log(storage);
	// Load tasks from localStorage
	if (parsedTasks) {
		parsedTasks.forEach((taskMeta) => {
			const { text, date, done } = taskMeta
			addTask(createTask(text, date, done));
		});
	};
	
	// Create eventListener for adding new tasks for creating new list tag.
	const myForm = document.querySelector('#form');
	const input = document.querySelector('#input');
	// Return back normal style after clicking on input after error.
	input.addEventListener('click', () => {
		input.classList.remove('formInvalid');
		input.placeholder = 'Add new task.';
	});
	myForm.addEventListener('submit', (evt) => {
		evt.preventDefault();
		// Checking for empty input and add 'red' warning in input.
		if (!input.value) {
			input.classList.add('formInvalid');
			input.placeholder = 'Empty task doesn"t add';
			return;
		}
		addToState(input.value);
		input.value = '';
	});
	// Buttom for listenning voice and write that voice to string.
	const voiceBtn = document.querySelector('#buttonVoice');

	// Getting speach Recognition to work.
	const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
	const recognition = new SpeechRecognition();
	recognition.interimResults = true;
	recognition.lang = 'en-US';

	// On click start to listen voice.
	voiceBtn.addEventListener('click', () => {
		recognition.start();
		recognition.addEventListener('result', (evt) => {
			const results = Array.from(evt.results);
			const transcript = results
			    .map(result => result[0].transcript)
			    .join('');

			// When stoped talking listening is end and adding li tag to list.
			const isFinal = results.some((result) => {
				return result.isFinal;
			});
			// const isFinal = evt.results[0].isFinal;
			if (isFinal) {
				addToState(transcript);
			};
		});
	});
});
