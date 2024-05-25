document.addEventListener("DOMContentLoaded", function(event) {
	document.getElementById('hyphenate').addEventListener('click', async function() {
		const inputText = document.getElementById('inputText').value.replace(/-/g, '=');
		const jsonFileURL = './words.json';

		try {
			const response = await fetch(jsonFileURL);

			if (!response.ok) {
				throw new Error('Failed to load JSON file');
			}

			const dict = await response.json();
			const lines = inputText.split('\n').map(line => line.trim()).join('\n');
			const words = lines.split(/\b/);

			// loop through every word
			for (let i = 0; i < words.length; i++) {
				const word = words[i];
				const sanitizedWord = word.replace(/[^a-zA-Z]/g, ''); // remove non-letter characters such as punctuation
				const lowerCaseWord = sanitizedWord.toLowerCase();
				const syllable = dict[lowerCaseWord]; // lookup in the dict (case insensitive)

				if (syllable) {
					const index = word.toLowerCase().indexOf(lowerCaseWord);

					if (index !== -1) {
						let replacedWord = syllable;
						let hyphenOffset = 0;

						// loop through all the letters of the replaced word and keep track of hyphens so all the letters are capitalized correctly
						for (let j = 0; j < replacedWord.length; j++) {
							if (replacedWord[j] === '-')
								hyphenOffset++;
							if (word[j - hyphenOffset] === word[j - hyphenOffset].toUpperCase())
								replacedWord = replacedWord.substring(0, j) + replacedWord[j].toUpperCase() + replacedWord.substring(j + 1);
						}
						words[i] = replacedWord;
					}
				}
				
			}

			const outputText = words.join('');

			document.getElementById('outputText').value = outputText;

			if (document.getElementById('copyToClipboard').checked) {
				if (navigator.clipboard) {
					navigator.clipboard.writeText(outputText);
				} else {
					document.getElementById('outputText').select();
					document.execCommand('copy');
				}
			}
		} catch (error) {
			console.error('Error:', error);
			document.getElementById('outputText').value = 'An error occurred. Please check the console for details.';
		}
	});
});