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
			const words = lines.match(/[^\s]+|\s+/g);

			// loop through every word
			for (let i = 0; i < words.length; i++) {
				const word = words[i];

				if (/^\s+$/.test(word)) // ignore whitespace
					continue;

				let sanitizedWord = word.replace(/[^a-zA-Z']/g, ''); // remove non-letter characters except '
				let lowerCaseWord = sanitizedWord.toLowerCase();
				let isPlural = false;
			
				// check for plural words with "'s" at the end
				if (lowerCaseWord.endsWith("'s")) {
					lowerCaseWord = lowerCaseWord.slice(0, -2);
					sanitizedWord = sanitizedWord.slice(0, -2);
					isPlural = true;
				}
			
				const syllable = dict[lowerCaseWord]; // lookup in the dict (case insensitive)


				if (syllable) {
					// overcomplicated code to preserve the case of each character in relation to hyphens

					let capitalizedSyllable = '';
					let originalIndex = 0;

					for (let j = 0; j < syllable.length; j++) {
						if (syllable[j] === '-') {
							capitalizedSyllable += '-';
						} else {
							if (sanitizedWord[originalIndex] && sanitizedWord[originalIndex] === sanitizedWord[originalIndex].toUpperCase()) {
								capitalizedSyllable += syllable[j].toUpperCase();
							} else {
								capitalizedSyllable += syllable[j].toLowerCase();
							}
							originalIndex++;
						}
					}

					if (isPlural)
						capitalizedSyllable += "'s";

					// preserve original characters around the sanitized word
					const prefix = word.match(/^[^a-zA-Z']*/)[0]; // prefix non-alphabetic characters
					const suffix = word.match(/[^a-zA-Z']*$/)[0]; // suffix non-alphabetic characters
					words[i] = prefix + capitalizedSyllable + suffix;
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